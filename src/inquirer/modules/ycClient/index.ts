import pkg from 'appdata-path';
const { getAppDataPath } = pkg;
import { PuppeteerExtra } from 'puppeteer-extra';
import type { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import timer from 'timers/promises';
import z from 'zod';
import { Config } from '../../../config.js';
import eventListener from './eventListener.js';
import type {
  ThirdPartySearchResult,
  YouChatResponse,
} from '../../../shared/ts/youchat.js';
import eventListenerAppData from './eventListenerAppData.js';
import fetchSearchResults from './fetchSearchResults.js';

const pptr = new PuppeteerExtra(puppeteer);
pptr.use(StealthPlugin());

export default class YCClient {
  private c: z.infer<typeof Config>;
  private browser: Browser;
  private page: Page;
  private reqs = new Map<string, (...args) => void>();

  private selectors = {
    // Cloudflare selectors
    cfCheckPage: '.no-js',
    cfVerifyBtn: '.big-button.pow-button',
    cfCaptchaFrame: 'iframe',
    cfCaptchaCheckbox: "input[type='checkbox']",
    // YouChat selectors
    ycPage: '#__next',
  };

  constructor(config: z.infer<typeof Config>) {
    this.c = config;
  }

  async initBrowser(): Promise<void> {
    this.browser = await pptr.launch({
      headless: false,
      args: [
        `--user-data-dir=${getAppDataPath(this.c.appName)}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-sync',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-translate',
        '--no-experiments',
      ],
      executablePath: this.c.browserPath,
    });

    this.page = await this.browser.newPage();
    await this.page.goto('https://you.com/api');
    await this.waitPageForLoad(this.page);

    await this.page.exposeFunction('res', (url, data) => {
      const req = this.reqs.get(url);
      req(data);
    });
  }

  private async waitPageForLoad(page: Page): Promise<void> {
    if (!page) {
      throw new Error('Page is not loaded');
    }

    let attempt = 0;
    while (attempt < 3) {
      try {
        // Cloudflare check page selector
        const noJs = await page.$(this.selectors.cfCheckPage);

        // If Cloudflare check page is present
        if (noJs) {
          await timer.setTimeout(1000);

          try {
            // Wait for Cloudflare verify button
            await page.waitForSelector(this.selectors.cfVerifyBtn, {
              timeout: 5000,
            });

            // Click Cloudflare verify button
            const verifyBtn = await page.$(this.selectors.cfVerifyBtn);
            if (verifyBtn) {
              await Promise.all([timer.setTimeout(1000), verifyBtn.click()]);
            }
          } catch (_) {
            // Do nothing
          }

          try {
            // Wait for Cloudflare captcha iframe
            await page.waitForSelector(this.selectors.cfCaptchaFrame, {
              timeout: 5000,
            });
            const iframe = await page.$(this.selectors.cfCaptchaFrame);

            if (iframe) {
              await timer.setTimeout(2000);

              // Find Cloudflare captcha iframe
              const frame = page
                .frames()
                .find((f) => f.url().indexOf('challenges') !== -1);

              // Click Cloudflare captcha checkbox
              if (frame) {
                await frame.click(this.selectors.cfCaptchaCheckbox);
              }
            }
          } catch (_) {
            // Do nothing
          }
        }

        await this.page.waitForSelector(this.selectors.ycPage, {
          timeout: 20000,
        });

        attempt = 3;
      } catch (e) {
        console.log(e);
        attempt++;
      }
    }
  }

  public async getEventSource(
    url: string,
    asStream = false,
    onData?: (d) => void,
  ): Promise<Partial<YouChatResponse>> {
    const response: Partial<YouChatResponse> = {};

    return await new Promise(
      (
        resolve: (d: Partial<YouChatResponse>) => void,
        reject: (e: string) => void,
      ) => {
        const resolver = (e): void => {
          if (asStream) {
            onData(e);
          }
          if (e.done === true) {
            response.text = e.text.trim();
            resolve(response);
            this.reqs.delete(url);
          } else if (e.done === false) {
            reject(e.error);
            this.reqs.delete(url);
          } else if (!e.youChatToken) {
            Object.assign(response, e);
          }
        };

        this.reqs.set(url, resolver);
        this.page.evaluate(eventListener, url);
      },
    );
  }

  public async getAppData(
    url: string,
    appName: string,
  ): Promise<YouChatResponse['data']> {
    return await new Promise(
      (
        resolve: (d: YouChatResponse['data']) => void,
        reject: (e: string) => void,
      ) => {
        const resolver = (e): void => {
          if (e.done === true) {
            resolve(e.data);
            this.reqs.delete(url);
          } else if (e.done === false) {
            reject(e.error);
            this.reqs.delete(url);
          }
        };

        this.reqs.set(url, resolver);
        this.page.evaluate(eventListenerAppData, { url, appName });
      },
    );
  }

  public async getSearchResults(
    url: string,
  ): Promise<ThirdPartySearchResult[]> {
    return await new Promise(
      (
        resolve: (d: ThirdPartySearchResult[]) => void,
        reject: (e: string) => void,
      ) => {
        const resolver = (e): void => {
          if (e.done === true) {
            resolve(e.data);
            this.reqs.delete(url);
          } else if (e.done === false) {
            reject(e.error);
            this.reqs.delete(url);
          }
        };

        this.reqs.set(url, resolver);
        this.page.evaluate(fetchSearchResults, { url });
      },
    );
  }
}
