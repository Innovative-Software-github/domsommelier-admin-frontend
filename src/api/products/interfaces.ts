import type { CatalogReference, Packaging, ExtendedProductAttributes, WineAttributes, SparklingAttributes, SpiritAttributes } from './attributes';
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
  /** Акционная цена в рублях, null — акции нет. */
  salePrice: number | null;
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
  aroma: string | null;
  taste: string | null;
  foodPairing: string | null;
  /** Акционная цена в рублях, null — акции нет. */
  salePrice: number | null;
  productCountry: string;
  productCategoryName: ProductCategory;
  productPhoto: ProductPhoto[];
  brand?: CatalogReference | null;
  packaging?: Packaging | null;
  details: (Record<string, unknown> & ExtendedProductAttributes) | null;
}

export interface ProductReference {
  countries: string[];
  colors: string[] | null;
  types: string[] | null;
  subcategories: string[] | null;
  sugarContents: string[] | null;
}

export interface ProductWriteBase {
  brand?: CatalogReference | null;
  packaging?: Packaging | null;
  category: ProductCategory;
  article: string;
  name: string;
  initialPrice: number;
  price: number;
  description?: string;
  aroma?: string;
  taste?: string;
  foodPairing?: string;
  /** Акционная цена в рублях (не процент). Пусто/0 — акции нет. */
  salePrice?: number;
  country: string;
}

export interface WineWriteRequest extends ProductWriteBase {
  extendedDetails?: WineAttributes | null;
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
  extendedDetails?: SpiritAttributes | null;
  category: 'spirit';
  subcategory: string;
  strength: number;
  producer?: string;
  volume: number;
  features?: string[];
}

export interface SparklingWriteRequest extends ProductWriteBase {
  extendedDetails?: SparklingAttributes | null;
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
