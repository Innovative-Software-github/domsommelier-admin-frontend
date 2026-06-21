import type { Page } from '../config/page';

export type ProductCategory =
  | 'wine'
  | 'spirit'
  | 'champagne_and_sparkling'
  | 'low_alcohol'
  | 'snack'
  | 'accessories';

export interface ProductPhoto {
  id: string;
  bucket: string;
  name: string;
  description: string | null;
  url: string | null;
}

/** Элемент списка (ProductCardDto). Для вина присутствуют volume/color/type. */
export interface ProductCardItem {
  id: string;
  article: string;
  name: string;
  price: number;
  discount: number | null;
  productCountry: string;
  productCategoryName: string;
  productPhoto: ProductPhoto[];
  volume?: string;
  color?: string;
  type?: string;
}

/** Детальный товар (ProductDTO); details — поля категории. */
export interface ProductDetail {
  id: string;
  article: string;
  name: string;
  initialPrice: number;
  price: number;
  description: string | null;
  discount: number | null;
  productCountry: string;
  productCategoryName: ProductCategory;
  productPhoto: ProductPhoto[];
  details: Record<string, unknown> | null;
}

export interface ProductReference {
  countries: string[];
  colors: string[] | null;
  types: string[] | null;
  subcategories: string[] | null;
  sugarContents: string[] | null;
}

export interface ProductWriteBase {
  category: ProductCategory;
  article: string;
  name: string;
  initialPrice: number;
  price: number;
  description?: string;
  discount?: number;
  country: string;
}

export interface WineWriteRequest extends ProductWriteBase {
  category: 'wine';
  productionYear: number;
  color: string;
  type?: string;
  grapes?: string[];
  producer?: string;
  volume: number;
  features?: string[];
}

export interface SpiritWriteRequest extends ProductWriteBase {
  category: 'spirit';
  subcategory: string;
  strength: number;
  producer?: string;
  volume: number;
  features?: string[];
}

export interface SparklingWriteRequest extends ProductWriteBase {
  category: 'champagne_and_sparkling';
  subcategory: string;
  sugarContent: string;
  color: string;
  producer?: string;
  volume: number;
  features?: string[];
}

export interface LowAlcoholWriteRequest extends ProductWriteBase {
  category: 'low_alcohol';
  subcategory: string;
  strength: number;
  producer?: string;
  volume: number;
  features?: string[];
}

export interface SnackWriteRequest extends ProductWriteBase {
  category: 'snack';
  subcategory: string;
  pairings?: string[];
  producer?: string;
}

export interface AccessoriesWriteRequest extends ProductWriteBase {
  category: 'accessories';
  producer?: string;
  features?: string[];
}

export type ProductWriteRequest =
  | WineWriteRequest
  | SpiritWriteRequest
  | SparklingWriteRequest
  | LowAlcoholWriteRequest
  | SnackWriteRequest
  | AccessoriesWriteRequest;

export interface ProductsQueryParams {
  category: ProductCategory;
  search?: string;
  page?: number;
  size?: number;
}

export type ProductsPage = Page<ProductCardItem>;
