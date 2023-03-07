import type { HTTPClient } from '../../index.js';
import fastifyOpenapiDocs from '@fastify/swagger';
import fastifySwagger from '@fastify/swagger-ui';

export default async function registerOpenAPI(this: HTTPClient) {
  await this.router.register(fastifyOpenapiDocs, {
    swagger: {
      info: {
        title: 'ChatAPI',
        description: 'Unofficial API for YouChat',
        version: '1.0.0',
      },
      host:
        process.env.NODE_ENV !== 'production'
          ? 'localhost:3000'
          : 'capi.ettie.uk',
      schemes: process.env.NODE_ENV !== 'production' ? ['http'] : ['https'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  });
  await this.router.register(fastifySwagger, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    staticCSP: false,
    transformSpecificationClone: true,
  });
}
