import config from '../config.js';
import YCClient from './modules/ycClient/index.js';
import { youChatReqPayload, YouChatReqPayload } from '../shared/ts/inq.js';
import getYCApiUrl from './utils/getYCurlString.js';
import beautifyRequestText from './utils/beautifyRequestText.js';
import beautifyResponseText from './utils/beautifyResponseText.js';
import parseApps from '../shared/modules/parse-apps/index.js';
import { YouChatResponse } from '../shared/ts/youchat.js';

export default class Inquirer {
  private c = config();
  private ycClient = new YCClient(this.c);

  public async start() {
    await this.ycClient.initBrowser();
  }

  async request(
    $payload: YouChatReqPayload,
  ): Promise<Partial<YouChatResponse>> {
    const payload = youChatReqPayload.parse($payload);
    payload.text = beautifyRequestText(payload.text);

    // Retreive response from YouChat
    const result =
      payload.getParam && payload.getParam !== ''
        ? await this.ycClient.getEventSourceParam(
            getYCApiUrl(payload),
            payload.getParam,
          )
        : await this.ycClient.getEventSource(getYCApiUrl(payload));

    // Parse apps if needed
    if (!payload.getParam && payload.parseApps === true) {
      const apps = await parseApps(result);
      if (apps) Object.assign(result, apps);
    }

    if (result.text) result.text = beautifyResponseText(result.text);

    return result;
  }
}
