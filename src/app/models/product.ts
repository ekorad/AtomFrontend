import { Review } from './review';
export interface Product {
  [propName: string]: number | string | null | Review[];
  id: number;
  productName: string;
  description: string;
  oldPrice: number | null;
  newPrice: number;
  reviews: Review[];
  cpu: string;
  motherBoard: string;
  ram: string;
  gpu: string;
  views: number;
}
