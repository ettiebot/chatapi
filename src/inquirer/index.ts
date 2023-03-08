import config from '../config.js';
import YCClient from './modules/ycClient/index.js';
import {
  youChatGetAppDataPayload,
  YouChatGetAppDataPayload,
  youChatGetSearchResultsPayload,
  YouChatGetSearchResultsPayload,
  youChatReqPayload,
  YouChatReqPayload,
} from '../shared/ts/inq.js';
import getYCApiUrl from './utils/getYCurlString.js';
import beautifyRequestText from './utils/beautifyRequestText.js';
import beautifyResponseText from './utils/beautifyResponseText.js';
import parseApps from '../shared/modules/parse-apps/index.js';
import {
  ThirdPartySearchResult,
  YouChatResponse,
} from '../shared/ts/youchat.js';
import getYCSearchURLString from './utils/getYCSearchURLString.js';
import getYCApPDataURLString from './utils/getYCAppDataURLString.js';

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
    const result = await this.ycClient.getEventSource(getYCApiUrl(payload));

    // Parse apps if needed
    if (payload.parseApps === true) {
      const apps = await parseApps(result);
      if (apps) Object.assign(result, apps);
    }

    if (result.text) result.text = beautifyResponseText(result.text);

    return result;
  }

  async getAppData(
    $payload: YouChatGetAppDataPayload,
  ): Promise<Partial<YouChatResponse>> {
    const payload = youChatGetAppDataPayload.parse($payload);
    payload.text = beautifyRequestText(payload.text);

    const response: Partial<{ data: YouChatResponse['data']; text: string }> =
      {};

    // Retreive response from YouChat
    response.data = await this.ycClient.getAppData(
      getYCApPDataURLString(payload),
      payload.appName,
    );

    // Parse apps if needed
    if (payload.parseApps === true) {
      const apps = await parseApps({
        ydcAppName: payload.appName,
        data: response.data,
      });
      if (apps) Object.assign(response, apps);
    }

    if (response.text) response.text = beautifyResponseText(response.text);

    return response;
  }

  async getSearchResults(
    $payload: YouChatGetSearchResultsPayload,
  ): Promise<ThirdPartySearchResult[]> {
    const payload = youChatGetSearchResultsPayload.parse($payload);
    payload.text = beautifyRequestText(payload.text);

    const data: ThirdPartySearchResult[] = await this.ycClient.getSearchResults(
      getYCSearchURLString(payload),
    );

    return data;
  }
}
