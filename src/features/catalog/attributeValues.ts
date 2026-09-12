import type { AttributeField } from './attributeFields';
import { brandField, getAllAttributeFields, getAttributeFields, packagingField } from './attributeFields';
/** Only schema fields are sent; unknown fields are never silently invented. */
export function normalizeFields(values: Record<string, unknown> | null | undefined, fields: AttributeField[]): Record<string, unknown> | null {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    let value = values?.[field.key] ?? null;
    if (field.type === 'object') value = normalizeFields(value as Record<string, unknown> | null, field.fields || []);
    else if (field.type === 'list' && Array.isArray(value)) value = value.map(row => normalizeFields(row, field.fields || []));
    else if (field.type === 'text' && typeof value === 'string') value = value.trim() || null;
    else if (field.type === 'enum' && field.options?.some(option => typeof option.value === 'boolean')) value = value === 'true' || value === true ? true : value === 'false' || value === false ? false : null;
    result[field.key] = value;
  }
  const populated = Object.values(result).some(value => value !== null);
  if (populated && fields.some(field => field.key === 'value') && fields.some(field => field.key === 'sourceId')) {
    result.scaleMin = 1;
    result.scaleMax = 5;
  }
  return populated ? result : null;
}
export function attributesFromDetail(category: string, details: Record<string, unknown> | null) {
  const values = Object.fromEntries(getAllAttributeFields(category).map(field => [field.key, details?.[field.key] ?? null]));
  return enumValuesForForm(values);
}
export function enumValuesForForm(value: unknown): unknown {
  if (typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(enumValuesForForm);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, enumValuesForForm(item)]));
  return value;
}
export function extraWriteValues(category: string, subcategory: string | undefined, values: { brand?: unknown; packaging?: unknown; extendedDetails?: unknown }) {
  return {
    ...(normalizeFields(values as Record<string, unknown>, [brandField, packagingField]) ?? { brand: null, packaging: null }),
    ...(['wine', 'spirit', 'champagne_and_sparkling'].includes(category) ? { extendedDetails: normalizeFields(values.extendedDetails as Record<string, unknown> | null, getAttributeFields(category, subcategory)) } : {}),
  };
}
