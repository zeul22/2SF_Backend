// src/scrapers/InterfloraScraper.ts

import { Page } from 'playwright';
import { randomUUID } from 'crypto';
import { BaseScraper } from './BaseScraper';
import { SunflowerOffer } from '../shared/types';
import { extractPriceToPaise } from '../shared/utils';

export class InterfloraScraper extends BaseScraper {
  readonly source = 'INTERFLORA' as const;

  // Sunflower search page
  readonly startUrls = ['https://www.interflora.in/search?q=sunflower'];

  protected async scrapeListPage(page: Page): Promise<SunflowerOffer[]> {
    const offers: SunflowerOffer[] = [];

    // Let the page load
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(4000);

    // Wait for at least one product card
    await page
      .waitForSelector('.product-grid-item.product-grid-item-revamp[data-pid]', {
        timeout: 20000,
      })
      .catch(() => {});

    // Scroll once to trigger lazy-loading, just in case
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let total = 0;
        const step = 600;
        const timer = setInterval(() => {
          window.scrollBy(0, step);
          total += step;
          if (total >= document.body.scrollHeight - window.innerHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });

    await page.waitForTimeout(1500);

    // 🔥 One shot: extract everything inside the page context
    const rawItems = await page.$$eval(
      '.product-grid-item.product-grid-item-revamp[data-pid]',
      (cards) => {
        type Raw = {
          title: string;
          href: string;
          priceText: string;
          imageUrl: string | null;
        };

        const items: Raw[] = [];

        for (const cardNode of cards) {
          const card = cardNode as HTMLElement;

          const title =
            (card.getAttribute('data-name') || '').trim() ||
            ((card.querySelector('.product-name, .product-name-revamp') as HTMLElement | null)
              ?.innerText.trim() ?? '');

          if (!title) continue;

          const priceAttr = (card.getAttribute('data-price') || '').trim();
          const priceEl = card.querySelector(
            '.product-price span, .product-price'
          ) as HTMLElement | null;
          const priceText = (priceAttr || priceEl?.innerText || '').trim();
          if (!priceText) continue;

          const anchor =
            (card.querySelector('a.image-holder') as HTMLAnchorElement | null) || null;
          const hrefAttr = anchor?.getAttribute('href') || card.getAttribute('data-url') || '';
          const href = hrefAttr.trim();
          if (!href) continue;

          const img =
            (card.querySelector('a.image-holder img') as HTMLImageElement | null) || null;
          const imageUrl =
            img?.src || img?.getAttribute('data-original') || img?.getAttribute('src') || null;

          items.push({
            title,
            href,
            priceText,
            imageUrl,
          });
        }

        return items;
      }
    );

    console.log('[INTERFLORA] RAW ITEMS COUNT:', rawItems.length);
    console.log('[INTERFLORA] RAW TITLES:', rawItems.map((i) => i.title));

    for (const item of rawItems) {
      const { title, href, priceText, imageUrl } = item;

      const paise = extractPriceToPaise(priceText);
      if (!paise) {
        console.log('[INTERFLORA] SKIP (extractPriceToPaise failed):', title, priceText);
        continue;
      }

      const productUrl = new URL(href, page.url()).toString();

      offers.push({
        id: randomUUID(),
        source: this.source,
        title,
        price: paise,
        currency: 'INR',
        productUrl,
        imageUrl: imageUrl || null,
        type: 'bouquet',
        scrapedAt: new Date(),
      });
    }

    console.log(
      `[INTERFLORA] FINAL OFFERS COUNT on ${page.url()}:`,
      offers.length
    );

    return offers;
  }
}
