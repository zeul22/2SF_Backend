import { Page } from 'playwright';
import { SunflowerOffer } from '../shared/types';
export declare abstract class BaseScraper {
    abstract readonly source: string;
    abstract readonly startUrls: string[];
    protected abstract scrapeListPage(page: Page): Promise<SunflowerOffer[]>;
    run(): Promise<SunflowerOffer[]>;
}
//# sourceMappingURL=BaseScraper.d.ts.map