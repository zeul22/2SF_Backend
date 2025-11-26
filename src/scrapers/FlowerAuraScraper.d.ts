import { Page } from 'playwright';
import { BaseScraper } from './BaseScraper';
import { SunflowerOffer } from '../shared/types';
export declare class FlowerAuraScraper extends BaseScraper {
    source: "FLOWERAURA";
    startUrls: string[];
    protected scrapeListPage(page: Page): Promise<SunflowerOffer[]>;
}
//# sourceMappingURL=FlowerAuraScraper.d.ts.map