"use strict";
// src/scrapers/InterfloraScraper.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterfloraScraper = void 0;
const crypto_1 = require("crypto");
const BaseScraper_1 = require("./BaseScraper");
const utils_1 = require("../shared/utils");
class InterfloraScraper extends BaseScraper_1.BaseScraper {
    source = 'INTERFLORA';
    // Sunflower search page
    startUrls = ['https://www.interflora.in/search?q=sunflower'];
    async scrapeListPage(page) {
        const offers = [];
        // Let the page load
        await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => { });
        await page.waitForTimeout(4000);
        // Wait for at least one product card
        await page
            .waitForSelector('.product-grid-item.product-grid-item-revamp[data-pid]', {
            timeout: 20000,
        })
            .catch(() => { });
        // Scroll once to trigger lazy-loading, just in case
        await page.evaluate(async () => {
            await new Promise((resolve) => {
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
        const rawItems = await page.$$eval('.product-grid-item.product-grid-item-revamp[data-pid]', (cards) => {
            const items = [];
            for (const cardNode of cards) {
                const card = cardNode;
                const title = (card.getAttribute('data-name') || '').trim() ||
                    (card.querySelector('.product-name, .product-name-revamp')
                        ?.innerText.trim() ?? '');
                if (!title)
                    continue;
                const priceAttr = (card.getAttribute('data-price') || '').trim();
                const priceEl = card.querySelector('.product-price span, .product-price');
                const priceText = (priceAttr || priceEl?.innerText || '').trim();
                if (!priceText)
                    continue;
                const anchor = card.querySelector('a.image-holder') || null;
                const hrefAttr = anchor?.getAttribute('href') || card.getAttribute('data-url') || '';
                const href = hrefAttr.trim();
                if (!href)
                    continue;
                const img = card.querySelector('a.image-holder img') || null;
                const imageUrl = img?.src || img?.getAttribute('data-original') || img?.getAttribute('src') || null;
                items.push({
                    title,
                    href,
                    priceText,
                    imageUrl,
                });
            }
            return items;
        });
        console.log('[INTERFLORA] RAW ITEMS COUNT:', rawItems.length);
        console.log('[INTERFLORA] RAW TITLES:', rawItems.map((i) => i.title));
        for (const item of rawItems) {
            const { title, href, priceText, imageUrl } = item;
            const paise = (0, utils_1.extractPriceToPaise)(priceText);
            if (!paise) {
                console.log('[INTERFLORA] SKIP (extractPriceToPaise failed):', title, priceText);
                continue;
            }
            const productUrl = new URL(href, page.url()).toString();
            offers.push({
                id: (0, crypto_1.randomUUID)(),
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
        console.log(`[INTERFLORA] FINAL OFFERS COUNT on ${page.url()}:`, offers.length);
        return offers;
    }
}
exports.InterfloraScraper = InterfloraScraper;
//# sourceMappingURL=InterfloraScraper.js.map