import type { Rule } from 'antd/es/form';
import type { City, CityRequestBody } from '../../api/cities/interfaces';

export interface CityFormValues {
  slug: string;
  name: string;
  active: boolean;
  sortOrder: number;
}

export const DEFAULT_CITY_FORM_VALUES: CityFormValues = {
  slug: '',
  name: '',
  active: true,
  sortOrder: 0,
};

export const CITY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CITY_FORM_RULES: Record<keyof CityFormValues, Rule[]> = {
  slug: [
    { required: true, message: 'Укажите slug' },
    {
      pattern: CITY_SLUG_PATTERN,
      message: 'Только строчные латинские буквы, цифры и дефис',
    },
  ],
  name: [{ required: true, message: 'Укажите название' }],
  active: [],
  sortOrder: [{ type: 'number', min: 0, message: 'Неотрицательное число' }],
};

export function toCityFormValues(city: City): CityFormValues {
  return {
    slug: city.slug,
    name: city.name,
    active: city.active,
    sortOrder: city.sortOrder,
  };
}

export function toCityRequestBody(values: CityFormValues): CityRequestBody {
  return {
    slug: values.slug.trim().toLowerCase(),
    name: values.name.trim(),
    active: values.active,
    sortOrder: values.sortOrder ?? 0,
  };
}
