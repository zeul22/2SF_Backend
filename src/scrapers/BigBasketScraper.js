"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigBasketScraper = void 0;
const BaseScraper_1 = require("./BaseScraper");
const utils_1 = require("../shared/utils");
const crypto_1 = require("crypto");
class BigBasketScraper extends BaseScraper_1.BaseScraper {
    source = 'BIGBASKET';
    startUrls = [
        'https://www.bigbasket.com/pc/fruits-vegetables/flower-bouquets-bunches/',
    ];
    async scrapeListPage(page) {
        // BigBasket product tiles often: '.ProductCard__wrapper' / '[qa="product"]' depending on layout.
        const cards = await page.$$('[qa="product"], .ProductCard__content, .bb-product-card, li');
        const offers = [];
        for (const card of cards) {
            const title = (await card
                .$eval('a, .item-name, .product-name', (el) => el.innerText)
                .catch(() => null))?.trim();
            if (!title || !(0, utils_1.looksLikeSunflower)(title))
                continue;
            const priceText = await card
                .$eval('.mp-price, .pricing, .bb-price, [class*="price"]', (el) => el.innerText)
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
                type: 'single', // often it's "fresho! Sunflower, 1 pc" etc.
                scrapedAt: new Date(),
            });
        }
        return offers;
    }
}
exports.BigBasketScraper = BigBasketScraper;
//# sourceMappingURL=BigBasketScraper.js.map