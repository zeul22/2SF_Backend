"use strict";
// src/scripts/scrapeAll.ts
Object.defineProperty(exports, "__esModule", { value: true });
const InterfloraScraper_1 = require("../scrapers/InterfloraScraper");
const FNPScraper_1 = require("../scrapers/FNPScraper");
const FlowerAuraScraper_1 = require("../scrapers/FlowerAuraScraper");
const utils_1 = require("../shared/utils");
async function main() {
    const scrapers = [
        new FNPScraper_1.FnpScraper(),
        new FlowerAuraScraper_1.FlowerAuraScraper(),
        new InterfloraScraper_1.InterfloraScraper()
        // if you add more scrapers, push them here
    ];
    const allOffers = [];
    for (const scraper of scrapers) {
        console.log(`\n=== Running scraper: ${scraper.source} ===`);
        const offers = await scraper.run();
        allOffers.push(...offers);
    }
    console.log('\n=== Done. All offers: ===');
    console.log(JSON.stringify(allOffers, null, 2));
    console.log(`\n===Total Data Collected: ${allOffers.length}===`);
    const filePath = (0, utils_1.saveOffersToMarkdown)(allOffers, "sunflower-offers");
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=scrapeAll.js.map