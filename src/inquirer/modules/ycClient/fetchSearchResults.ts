export default ({ url }): void => {
  fetch(url)
    .then(async (resp) => {
      const data = await resp.json();
      const searchResults =
        data?.searchResults?.mainline?.third_party_search_results;
      if (searchResults) {
        res(url, { done: true, data: searchResults });
      } else {
        res(url, { done: false });
      }
    })
    .catch((e) => res(url, { done: false, error: e.toString() }));
};

const fetch = (e): Promise<any> => void e;
const res = (u: string, e: any) => void e && void u;
