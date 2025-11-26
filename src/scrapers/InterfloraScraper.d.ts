import { Page } from 'playwright';
import { BaseScraper } from './BaseScraper';
import { SunflowerOffer } from '../shared/types';
export declare class InterfloraScraper extends BaseScraper {
    readonly source: "INTERFLORA";
    readonly startUrls: string[];
    protected scrapeListPage(page: Page): Promise<SunflowerOffer[]>;
}
//# sourceMappingURL=InterfloraScraper.d.ts.map