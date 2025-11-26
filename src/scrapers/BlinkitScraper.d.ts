import { Page } from 'playwright';
import { BaseScraper } from './BaseScraper';
import { SunflowerOffer } from '../shared/types';
export declare class BlinkitScraper extends BaseScraper {
    source: "BLINKIT";
    startUrls: string[];
    protected scrapeListPage(page: Page): Promise<SunflowerOffer[]>;
}
//# sourceMappingURL=BlinkitScraper.d.ts.map