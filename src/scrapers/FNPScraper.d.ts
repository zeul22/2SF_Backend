import { Page } from 'playwright';
import { BaseScraper } from './BaseScraper';
import { SunflowerOffer } from '../shared/types';
export declare class FnpScraper extends BaseScraper {
    readonly source: "FNP";
    readonly startUrls: string[];
    protected scrapeListPage(page: Page): Promise<SunflowerOffer[]>;
}
//# sourceMappingURL=FNPScraper.d.ts.map