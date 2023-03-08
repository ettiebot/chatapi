import { randomUUID } from 'crypto';
import { YouChatGetAppDataPayload } from '../../shared/ts/inq.js';

export default function getYCApPDataURLString(
  payload: YouChatGetAppDataPayload,
): string {
  const opts = {
    page: 1,
    count: 0,
    safeSearch: 'Off',
    onShoppingPage: false,
    mkt: '',
    responseFilter:
      'WebPages,Translations,TimeZone,Computation,RelatedSearches',
    domain: 'search',
    queryTraceId: randomUUID(),
    q: payload.text,
  };

  const str = Object.entries(opts)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');
  return `https://you.com/api/streamingSearch?${str}`;
}
