export default ({ url, appName }): void => {
  const es = new EventSource(url);

  const process = (e) => {
    const app = JSON.parse(e.data);
    if (app.ydcAppName === appName) {
      res(url, { done: true, data: app.data });
      es.close();
    }
  };

  es.addEventListener('appData', (e) => process(e));
  es.addEventListener('done', () => {
    es.close();
  });
  es.onerror = (e): void => {
    console.error(e);
    es.close();
    res(url, { done: false, error: e.toString() });
  };
};

const EventSource = (e): void => void e;
const res = (u: string, e: any) => void e && void u;
