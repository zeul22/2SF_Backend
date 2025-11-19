import { Page } from 'playwright';
import { BaseScraper } from './BaseScraper';
import { SunflowerOffer } from '../shared/types';
import { extractPriceToPaise, looksLikeSunflower } from '../shared/utils';
import { randomUUID } from 'crypto';


export class BlinkitScraper extends BaseScraper {
  source = 'BLINKIT' as const;
  startUrls = ['https://blinkit.com/cn/bouquets/cid/1487/1429'];

  protected async scrapeListPage(page: Page): Promise<SunflowerOffer[]> {
    // Blinkit product grid: look for product cards like '.Product__content' or '[data-testid="product"]'
    const cards = await page.$$(
      '[data-testid="product"], .Product__content, .ProductCard__wrapper, li'
    );

    const offers: SunflowerOffer[] = [];

    for (const card of cards) {
      const title = (
        await card
          .$eval(
            'h3, .product-name, .Product__title, a',
            (el) => (el as HTMLElement).innerText
          )
          .catch(() => null)
      )?.trim();

      if (!title || !looksLikeSunflower(title)) continue;

      const priceText = await card
        .$eval(
          '.price, .Product__price, [class*="price"]',
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
        type: 'bouquet',
        scrapedAt: new Date(),
      });
    }

    return offers;
  }
}
