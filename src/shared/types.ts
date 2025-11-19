// src/shared/types.ts

export interface SunflowerOffer {
  id: string;
  source: string;
  title: string;
  price: number;        // in paise
  currency: 'INR';
  productUrl: string;
  imageUrl: string | null;
  type: 'bouquet';
  scrapedAt: Date;
}
