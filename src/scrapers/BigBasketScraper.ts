import { Page } from 'playwright';
import { BaseScraper } from './BaseScraper';
import { SunflowerOffer } from '../shared/types';
import { extractPriceToPaise, looksLikeSunflower } from '../shared/utils';
import { randomUUID } from 'crypto';

export class BigBasketScraper extends BaseScraper {
  source = 'BIGBASKET' as const;
  startUrls = [
    'https://www.bigbasket.com/pc/fruits-vegetables/flower-bouquets-bunches/',
  ];

  protected async scrapeListPage(page: Page): Promise<SunflowerOffer[]> {
    // BigBasket product tiles often: '.ProductCard__wrapper' / '[qa="product"]' depending on layout.
    const cards = await page.$$(
      '[qa="product"], .ProductCard__content, .bb-product-card, li'
    );

    const offers: SunflowerOffer[] = [];

    for (const card of cards) {
      const title = (
        await card
          .$eval(
            'a, .item-name, .product-name',
            (el) => (el as HTMLElement).innerText
          )
          .catch(() => null)
      )?.trim();

      if (!title || !looksLikeSunflower(title)) continue;

      const priceText = await card
        .$eval(
          '.mp-price, .pricing, .bb-price, [class*="price"]',
          (el) => (el as HTMLElement).innerText
        )
        .catch(() => null);

      const href = await card
        .$eval('a', (el) => (el as HTMLAnchorElement).href)
        .catch(() => null);

      const img = await card
        .$eval(
          'img',
          (el) =>
            (el as HTMLImageElement).src ||
            (el as HTMLImageElement).dataset.src ||
            ''
        )
        .catch(() => null);

      if (!priceText || !href) continue;

      const paise = extractPriceToPaise(priceText);
      if (!paise) continue;

      offers.push({
        id: randomUUID(),
        source: this.source,
        title,
        price: paise,
        currency: 'INR',
        productUrl: href,
        imageUrl: img || null,
        type: 'single', // often it's "fresho! Sunflower, 1 pc" etc.
        scrapedAt: new Date(),
      });
    }

    return offers;
  }
}
