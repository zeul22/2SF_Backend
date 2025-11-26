import { Page } from 'playwright';
import { BaseScraper } from './BaseScraper';
import { SunflowerOffer } from '../shared/types';
export declare class BigBasketScraper extends BaseScraper {
    source: "BIGBASKET";
    startUrls: string[];
    protected scrapeListPage(page: Page): Promise<SunflowerOffer[]>;
}
//# sourceMappingURL=BigBasketScraper.d.ts.map