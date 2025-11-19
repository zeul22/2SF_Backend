// src/scripts/scrapeAll.ts

import { InterfloraScraper } from '../scrapers/InterfloraScraper';
import { FnpScraper } from '../scrapers/FNPScraper';
import { FlowerAuraScraper } from '../scrapers/FlowerAuraScraper';
import { saveOffersToMarkdown } from '../shared/utils';
async function main() {
  const scrapers = [
    new FnpScraper(),
    new FlowerAuraScraper(),
    new InterfloraScraper()
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
  console.log(`\n===Total Data Collected: ${allOffers.length}===`)
  const filePath = saveOffersToMarkdown(allOffers, "sunflower-offers");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
