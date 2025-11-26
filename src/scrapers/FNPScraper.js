"use strict";
// src/scrapers/FnpScraper.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.FnpScraper = void 0;
const crypto_1 = require("crypto");
const BaseScraper_1 = require("./BaseScraper");
const utils_1 = require("../shared/utils");
class FnpScraper extends BaseScraper_1.BaseScraper {
    source = 'FNP';
    startUrls = ['https://www.fnp.com/sunflowers-lp'];
    async scrapeListPage(page) {
        const offers = [];
        // Give the SPA some time to render
        await page.waitForTimeout(3000);
        // Wait until at least one product card is present
        await page.waitForSelector('[data-productid]', { timeout: 15000 }).catch(() => { });
        // Scroll to the bottom to trigger lazy loading if any
        await page.evaluate(async () => {
            await new Promise((resolve) => {
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
            if (!title)
                continue;
            // Optional: since it's a sunflower LP, this is just extra safety
            if (!(0, utils_1.looksLikeSunflower)(title)) {
                continue;
            }
            // Price (numeric value from itemprop="price")
            const rawPrice = await card
                .locator('[itemprop="price"]')
                .first()
                .textContent()
                .catch(() => null);
            if (!rawPrice)
                continue;
            const priceText = rawPrice.trim(); // e.g. "1149"
            const paise = (0, utils_1.extractPriceToPaise)(priceText);
            if (!paise)
                continue;
            // Product URL
            const href = await card
                .locator('a[itemprop="url"][href], a[href]')
                .first()
                .evaluate((el) => el.href)
                .catch(() => null);
            if (!href)
                continue;
            // Image URL
            const imageUrl = await card
                .locator('img[itemprop="image"], img')
                .first()
                .evaluate((el) => {
                const img = el;
                return img.src || img.getAttribute('data-src') || '';
            })
                .catch(() => '');
            offers.push({
                id: (0, crypto_1.randomUUID)(),
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
exports.FnpScraper = FnpScraper;
//# sourceMappingURL=FNPScraper.js.map