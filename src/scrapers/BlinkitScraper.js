"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlinkitScraper = void 0;
const BaseScraper_1 = require("./BaseScraper");
const utils_1 = require("../shared/utils");
const crypto_1 = require("crypto");
class BlinkitScraper extends BaseScraper_1.BaseScraper {
    source = 'BLINKIT';
    startUrls = ['https://blinkit.com/cn/bouquets/cid/1487/1429'];
    async scrapeListPage(page) {
        // Blinkit product grid: look for product cards like '.Product__content' or '[data-testid="product"]'
        const cards = await page.$$('[data-testid="product"], .Product__content, .ProductCard__wrapper, li');
        const offers = [];
        for (const card of cards) {
            const title = (await card
                .$eval('h3, .product-name, .Product__title, a', (el) => el.innerText)
                .catch(() => null))?.trim();
            if (!title || !(0, utils_1.looksLikeSunflower)(title))
                continue;
            const priceText = await card
                .$eval('.price, .Product__price, [class*="price"]', (el) => el.innerText)
                .catch(() => null);
            const href = await card
                .$eval('a', (el) => el.href)
                .catch(() => null);
            const img = await card
                .$eval('img', (el) => el.src ||
                el.dataset.src ||
                '')
                .catch(() => null);
            if (!priceText || !href)
                continue;
            const paise = (0, utils_1.extractPriceToPaise)(priceText);
            if (!paise)
                continue;
            offers.push({
                id: (0, crypto_1.randomUUID)(),
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
exports.BlinkitScraper = BlinkitScraper;
//# sourceMappingURL=BlinkitScraper.js.map