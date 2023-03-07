import type { HTTPClient } from '../../index.js';
import { YouChatReqPayload } from '../../../shared/ts/inq.js';
import verifyToken from '../../modules/auth.js';
import { User } from '../../../shared/ts/mongo.js';
import PQueue from 'p-queue';

interface IHeaders {
  user: User;
  'x-token': string;
}

const queue = new PQueue({
  concurrency: 1,
  timeout: 15 * 1000,
  throwOnTimeout: true,
  intervalCap: 5,
  interval: 15 * 1000,
});

export async function ycReq(this: HTTPClient) {
  const self = this;

  this.router.route<{ Querystring: YouChatReqPayload; Headers: IHeaders }>({
    method: 'GET',
    url: '/api/query',
    schema: {
      description: 'Make request to YouChat',
      querystring: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', description: 'Question text' },
          history: {
            type: 'array',
            description: 'Chat history',
            default: [],
          },
          chatId: { type: 'string', description: 'Chat ID', format: 'uuid' },
          searchResCount: {
            type: 'number',
            description: 'Search results count',
            minimum: 0,
            maximum: 5,
            default: 3,
          },
          safeSearch: {
            type: 'boolean',
            description: 'Safe search enabled?',
            default: false,
          },
          parseApps: {
            type: 'boolean',
            description:
              'Generate result text from apps (like Wikipedia or Weather)?',
            default: true,
          },
        },
      },
      // response: {
      //   200: {}
      // }
    },
    preHandler: this.router.auth([verifyToken.bind(self)]),
    async handler(request, reply) {
      const payload = request.query;
      // console.log(user);

      await queue
        .add(async () => {
          return await self.inq.request(payload);
        })
        .then((res) => reply.send({ result: res }))
        .catch((e) => reply.code(500).send({ error: e.toString() }));
    },
  });
}
