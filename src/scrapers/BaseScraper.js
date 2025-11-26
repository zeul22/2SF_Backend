"use strict";
// // src/scrapers/BaseScraper.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScraper = void 0;
// import { chromium, Page } from 'playwright';
// import { SunflowerOffer } from '../shared/types';
// export abstract class BaseScraper {
//   // E.g. "FNP"
//   abstract readonly source: string;
//   // List of URLs to start from
//   abstract readonly startUrls: string[];
//   // Each concrete scraper must implement how to scrape a list page
//   protected abstract scrapeListPage(page: Page): Promise<SunflowerOffer[]>;
//   /**
//    * Main entrypoint: opens a browser, visits each start URL,
//    * calls scrapeListPage, closes browser, returns all offers.
//    */
//   async run(): Promise<SunflowerOffer[]> {
//     const browser = await chromium.launch({ headless: true });
//     const context = await browser.newContext();
//     const page = await context.newPage();
//     const allOffers: SunflowerOffer[] = [];
//     try {
//       for (const url of this.startUrls) {
//         console.log(`[${this.source}] Navigating to: ${url}`);
//         await page.goto(url, { waitUntil: 'networkidle' });
//         const offers = await this.scrapeListPage(page);
//         console.log(
//           `[${this.source}] Found ${offers.length} offers on ${url}`,
//         );
//         allOffers.push(...offers);
//       }
//     } finally {
//       await browser.close();
//     }
//     return allOffers;
//   }
// }
// src/scrapers/BaseScraper.ts
const playwright_1 = require("playwright");
class BaseScraper {
    async run() {
        const browser = await playwright_1.chromium.launch({ headless: true });
        // const browser = await chromium.launch({ headless: false, slowMo: 250 });
        const context = await browser.newContext({
            // Use a realistic desktop UA so sites don't treat us as a bot straight away
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
                'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                'Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1366, height: 768 },
        });
        const page = await context.newPage();
        const allOffers = [];
        try {
            for (const url of this.startUrls) {
                console.log(`[${this.source}] Navigating to: ${url}`);
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
                // Give SPA / XHR some time to settle
                await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });
                const offers = await this.scrapeListPage(page);
                console.log(`[${this.source}] Found ${offers.length} offers on ${url}`);
                allOffers.push(...offers);
            }
        }
        finally {
            await browser.close();
        }
        return allOffers;
    }
}
exports.BaseScraper = BaseScraper;
//# sourceMappingURL=BaseScraper.js.map