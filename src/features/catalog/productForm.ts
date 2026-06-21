import type { Rule } from 'antd/es/form';
import type {
  ProductCategory,
  ProductDetail,
  ProductWriteRequest,
} from '../../api/products/interfaces';

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'wine', label: 'Вино' },
  { value: 'spirit', label: 'Крепкий' },
  { value: 'champagne_and_sparkling', label: 'Игристое' },
  { value: 'low_alcohol', label: 'Слабоалкогольное' },
  { value: 'snack', label: 'Снеки' },
  { value: 'accessories', label: 'Аксессуары' },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  PRODUCT_CATEGORIES.map((category) => [category.value, category.label]),
);

/** Все категории редактируемы (CRUD реализован для всех). */
export const EDITABLE_CATEGORIES: ProductCategory[] = PRODUCT_CATEGORIES.map((c) => c.value);

export function isEditableCategory(category: ProductCategory): boolean {
  return EDITABLE_CATEGORIES.includes(category);
}

/** Надмножество полей всех категорий — конкретные используются по категории. */
export interface ProductFormValues {
  // общие
  article: string;
  name: string;
  initialPrice: number;
  price: number;
  description?: string;
  discount?: number;
  country: string;
  producer?: string;
  volume?: number;
  features?: string[];
  // вино
  productionYear?: number;
  color?: string;
  type?: string;
  grapes?: string[];
  // крепкий / слабоалкогольное
  strength?: number;
  // подкатегория (крепкий, игристое, слабоалкогольное, снеки)
  subcategory?: string;
  // игристое
  sugarContent?: string;
  // снеки
  pairings?: string[];
}

export const DEFAULT_PRODUCT_FORM_VALUES: ProductFormValues = {
  article: '',
  name: '',
  initialPrice: 0,
  price: 0,
  country: '',
  grapes: [],
  features: [],
  pairings: [],
};

export const FIELD_RULES: Record<string, Rule[]> = {
  article: [{ required: true, message: 'Укажите артикул' }],
  name: [{ required: true, message: 'Укажите название' }],
  initialPrice: [
    { required: true, message: 'Укажите начальную цену' },
    { type: 'number', min: 0, message: 'Цена не может быть отрицательной' },
  ],
  price: [
    { required: true, message: 'Укажите цену' },
    { type: 'number', min: 0, message: 'Цена не может быть отрицательной' },
  ],
  discount: [{ type: 'number', min: 0, max: 100, message: 'Скидка 0–100%' }],
  country: [{ required: true, message: 'Выберите страну' }],
  subcategory: [{ required: true, message: 'Выберите подкатегорию' }],
  color: [{ required: true, message: 'Выберите цвет' }],
  sugarContent: [{ required: true, message: 'Выберите содержание сахара' }],
  productionYear: [
    { required: true, message: 'Укажите год' },
    { type: 'number', min: 1900, max: 2100, message: 'Год 1900–2100' },
  ],
  strength: [
    { required: true, message: 'Укажите крепость' },
    { type: 'number', min: 0, message: 'Крепость не может быть отрицательной' },
  ],
  volume: [
    { required: true, message: 'Укажите объём' },
    { type: 'number', min: 0, message: 'Объём не может быть отрицательным' },
  ],
};

function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function trimToUndefined(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function strList(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

/** Деталь товара → значения формы (учитывает разные ключи details по категориям). */
export function detailToFormValues(
  category: ProductCategory,
  product: ProductDetail,
): ProductFormValues {
  const d = (product.details ?? {}) as Record<string, unknown>;
  const base: ProductFormValues = {
    article: product.article,
    name: product.name,
    initialPrice: product.initialPrice,
    price: product.price,
    description: product.description ?? undefined,
    discount: product.discount ?? undefined,
    country: product.productCountry,
    producer: str(d.producer),
    volume: parseNumber(d.volume),
    features: strList(d.features),
  };

  switch (category) {
    case 'wine':
      return {
        ...base,
        productionYear: typeof d.productionYear === 'number' ? d.productionYear : undefined,
        color: str(d.color),
        type: str(d.type),
        grapes: strList(d.grapes),
      };
    case 'spirit':
      return { ...base, subcategory: str(d.category), strength: parseNumber(d.strength) };
    case 'champagne_and_sparkling':
      return {
        ...base,
        subcategory: str(d.subcategory),
        sugarContent: str(d.content),
        color: str(d.color),
      };
    case 'low_alcohol':
      return { ...base, subcategory: str(d.subcategory), strength: parseNumber(d.strength) };
    case 'snack':
      return { ...base, subcategory: str(d.category), pairings: strList(d.pairings), volume: undefined };
    case 'accessories':
      return { ...base, volume: undefined };
    default:
      return base;
  }
}

/** Значения формы → запрос на создание/обновление по категории. */
export function toWriteRequest(
  category: ProductCategory,
  values: ProductFormValues,
): ProductWriteRequest {
  const base = {
    article: values.article.trim(),
    name: values.name.trim(),
    initialPrice: values.initialPrice,
    price: values.price,
    description: trimToUndefined(values.description),
    discount: values.discount ?? undefined,
    country: values.country,
  };

  switch (category) {
    case 'wine':
      return {
        ...base,
        category,
        productionYear: values.productionYear as number,
        color: values.color as string,
        type: trimToUndefined(values.type),
        grapes: values.grapes ?? [],
        producer: trimToUndefined(values.producer),
        volume: values.volume as number,
        features: values.features ?? [],
      };
    case 'spirit':
      return {
        ...base,
        category,
        subcategory: values.subcategory as string,
        strength: values.strength as number,
        producer: trimToUndefined(values.producer),
        volume: values.volume as number,
        features: values.features ?? [],
      };
    case 'champagne_and_sparkling':
      return {
        ...base,
        category,
        subcategory: values.subcategory as string,
        sugarContent: values.sugarContent as string,
        color: values.color as string,
        producer: trimToUndefined(values.producer),
        volume: values.volume as number,
        features: values.features ?? [],
      };
    case 'low_alcohol':
      return {
        ...base,
        category,
        subcategory: values.subcategory as string,
        strength: values.strength as number,
        producer: trimToUndefined(values.producer),
        volume: values.volume as number,
        features: values.features ?? [],
      };
    case 'snack':
      return {
        ...base,
        category,
        subcategory: values.subcategory as string,
        pairings: values.pairings ?? [],
        producer: trimToUndefined(values.producer),
      };
    case 'accessories':
      return {
        ...base,
        category,
        producer: trimToUndefined(values.producer),
        features: values.features ?? [],
      };
    default:
      throw new Error(`Категория ${category} не поддерживается`);
  }
}
