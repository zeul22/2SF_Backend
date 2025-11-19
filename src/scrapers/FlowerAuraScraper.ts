// src/scrapers/FlowerAuraScraper.ts
import { Page } from 'playwright';
import { randomUUID } from 'crypto';
import { BaseScraper } from './BaseScraper';
import { SunflowerOffer } from '../shared/types';
import { extractPriceToPaise } from '../shared/utils';

export class FlowerAuraScraper extends BaseScraper {
  source = 'FLOWERAURA' as const;

  // Let BaseScraper handle navigation using this URL
  startUrls = ['https://www.floweraura.com/flowers/sunflower'];

  protected async scrapeListPage(page: Page): Promise<SunflowerOffer[]> {
    const offers: SunflowerOffer[] = [];

    // Give the page time to fully render
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);

    // Scroll a bit to trigger any lazy loading
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let total = 0;
        const step = 500;
        const timer = setInterval(() => {
          window.scrollBy(0, step);
          total += step;
          if (total > document.body.scrollHeight - window.innerHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });

    // Grab all product anchors that go to /p/flower/...
    const rawItems = await page.$$eval(
      'a[href*="/p/flower/"]',
      (links) => {
        type RawItem = {
          title: string;
          href: string;
          priceText: string | null;
          imageUrl: string | null;
        };

        const items: RawItem[] = [];

        for (const linkNode of links) {
          const a = linkNode as HTMLAnchorElement;
          const title = (a.textContent || '').trim();
          const href = a.href;

          if (!title || !href) continue;

          let node: HTMLElement | null = a;
          let priceText: string | null = null;
          let imageUrl: string | null = null;

          // Walk up a few ancestors, looking for a price and an image
          for (let depth = 0; depth < 6 && node; depth++) {
            const text = (node.textContent || '').trim();

            // First "₹ <number>" in this block of text
            if (!priceText && text) {
              const m = text.match(/₹\s*([\d,]+)/);
              if (m) {
                // keep the full matched "₹ 595" for clarity
                priceText = m[0];
              }
            }

            if (!imageUrl) {
              const img = node.querySelector('img');
              if (img && (img as HTMLImageElement).src) {
                imageUrl = (img as HTMLImageElement).src;
              }
            }

            if (priceText && imageUrl) break;
            node = node.parentElement;
          }

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

    console.log('[FLOWERAURA] RAW ITEMS COUNT (a[href*="/p/flower/"]):', rawItems.length);
    console.log('[FLOWERAURA] RAW TITLES:', rawItems.map((i) => i.title));

    for (const item of rawItems) {
      const { title, href, priceText, imageUrl } = item;

      if (!priceText) {
        console.log('[FLOWERAURA] SKIP (no priceText):', title, href);
        continue;
      }

      const paise = extractPriceToPaise(priceText);
      if (!paise) {
        console.log('[FLOWERAURA] SKIP (extractPriceToPaise failed):', title, priceText);
        continue;
      }

      // This page is already the sunflower category, so no extra title filtering
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

    console.log(
      `[FLOWERAURA] FINAL OFFERS COUNT on ${page.url()}:`,
      offers.length
    );

    return offers;
  }
}
