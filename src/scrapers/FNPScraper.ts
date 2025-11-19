// src/scrapers/FnpScraper.ts

import { Page } from 'playwright';
import { randomUUID } from 'crypto';
import { BaseScraper } from './BaseScraper';
import { SunflowerOffer } from '../shared/types';
import { extractPriceToPaise, looksLikeSunflower } from '../shared/utils';

export class FnpScraper extends BaseScraper {
  readonly source = 'FNP' as const;
  readonly startUrls = ['https://www.fnp.com/sunflowers-lp'];

  protected async scrapeListPage(page: Page): Promise<SunflowerOffer[]> {
    const offers: SunflowerOffer[] = [];

    // Give the SPA some time to render
    await page.waitForTimeout(3000);

    // Wait until at least one product card is present
    await page.waitForSelector('[data-productid]', { timeout: 15000 }).catch(() => {});

    // Scroll to the bottom to trigger lazy loading if any
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 500;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 250);
      });
    });

    const cards = page.locator('[data-productid]');
    const count = await cards.count();
    console.log('[FNP] cards found:', count);

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);

      // Product title
      const rawTitle = await card
        .locator('[itemprop="name"]')
        .innerText()
        .catch(() => '');
      const title = rawTitle.trim();

      if (!title) continue;

      // Optional: since it's a sunflower LP, this is just extra safety
      if (!looksLikeSunflower(title)) {
        continue;
      }

      // Price (numeric value from itemprop="price")
      const rawPrice = await card
        .locator('[itemprop="price"]')
        .first()
        .textContent()
        .catch(() => null);

      if (!rawPrice) continue;

      const priceText = rawPrice.trim(); // e.g. "1149"
      const paise = extractPriceToPaise(priceText);
      if (!paise) continue;

      // Product URL
      const href = await card
        .locator('a[itemprop="url"][href], a[href]')
        .first()
        .evaluate((el) => (el as HTMLAnchorElement).href)
        .catch(() => null);

      if (!href) continue;

      // Image URL
      const imageUrl = await card
        .locator('img[itemprop="image"], img')
        .first()
        .evaluate((el) => {
          const img = el as HTMLImageElement;
          return img.src || img.getAttribute('data-src') || '';
        })
        .catch(() => '');

      offers.push({
        id: randomUUID(),
        source: this.source,
        title,
        price: paise,
        currency: 'INR',
        productUrl: href,
        imageUrl: imageUrl || null,
        type: 'bouquet',
        scrapedAt: new Date(),
      });
    }

    return offers;
  }
}
