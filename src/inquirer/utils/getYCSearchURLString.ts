import { YouChatGetSearchResultsPayload } from '../../shared/ts/inq.js';

export default function getYCSearchURLString(
  payload: Partial<YouChatGetSearchResultsPayload>,
): string {
  const opts = {
    page: 1,
    count: payload.searchResCount,
    safeSearch: payload.safeSearch ? 'On' : 'Off',
    onShoppingPage: false,
    mkt: '',
    responseFilter:
      'WebPages,Translations,TimeZone,Computation,RelatedSearches',
    domain: 'search',
    q: payload.text,
  };

  const str = Object.entries(opts)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');
  return `https://you.com/api/search?${str}`;
}
