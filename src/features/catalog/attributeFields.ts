export interface AttributeField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'enum' | 'reference' | 'references' | 'object' | 'list';
  kind?: string;
  min?: number;
  max?: number;
  integer?: boolean;
  options?: { value: string | boolean; label: string }[];
  fields?: AttributeField[];
}
const ref = (key: string, label: string, kind: string, multiple = false): AttributeField => ({ key, label, kind, type: multiple ? 'references' : 'reference' });
const number = (key: string, label: string, min = 0, max = 100, integer = false): AttributeField => ({ key, label, type: 'number', min, max, integer });
const text = (key: string, label: string): AttributeField => ({ key, label, type: 'text' });
const object = (key: string, label: string, fields: AttributeField[]): AttributeField => ({ key, label, type: 'object', fields });
const list = (key: string, label: string, fields: AttributeField[]): AttributeField => ({ key, label, type: 'list', fields });
const choice = (key: string, label: string, choices: [string | boolean, string][]): AttributeField => ({ key, label, type: 'enum', options: choices.map(([value, label]) => ({ value, label })) });
const yesNo = (key: string, label: string) => choice(key, label, [[true, 'Да'], [false, 'Нет']]);
const duration = object('durationMonths', 'Срок выдержки, месяцев', [number('min', 'От', 0, 2400), number('max', 'До', 0, 2400), yesNo('minInclusive', 'Нижняя граница включительно'), yesNo('maxInclusive', 'Верхняя граница включительно')]);
const composition = list('grapeComposition', 'Состав винограда', [ref('grape', 'Сорт', 'grape'), number('percent', 'Доля, %')]);
const rating: AttributeField[] = [number('value', 'Оценка (1–5)', 1, 5), text('sourceId', 'Источник оценки (URL или код)')];
export const packagingField = object('packaging', 'Упаковка', [yesNo('giftBox', 'Подарочная упаковка'), ref('type', 'Тип упаковки', 'packaging')]);
export const brandField = ref('brand', 'Бренд', 'brand');
const common: AttributeField[] = [ref('region', 'Регион', 'region'), ref('appellation', 'Апелласьон', 'appellation'),
  ref('aromaTags', 'Ароматические теги', 'aroma', true), ref('flavorTags', 'Вкусовые теги', 'flavor', true), ref('foodPairingTags', 'Гастросочетания', 'food_pairing', true),
  object('aging', 'Выдержка', [choice('status', 'Наличие выдержки', [['aged', 'Есть'], ['not_aged', 'Нет'], ['unknown', 'Неизвестно']]), ref('vessels', 'Ёмкости', 'vessel', true), duration, text('description', 'Описание выдержки')]),
  text('productionMethod', 'Способ производства'), object('servingTemperature', 'Температура подачи, °C', [number('min', 'От', -20), number('max', 'До', -20)])];
const wine: AttributeField[] = [...common, number('strength', 'Крепость, %'), composition, yesNo('grapeCompositionComplete', 'Указан полный состав (сумма 100%)'),
  object('sensoryProfile', 'Вкусовой профиль: оценка, шкала и источник', ['sweetness:Сладость', 'acidity:Кислотность', 'aromaticIntensity:Ароматичность', 'body:Тело', 'tannins:Танины'].map(item => { const [key, label] = item.split(':'); return object(key, label, rating); })),
  ref('styleTags', 'Стилистика', 'style', true), object('cellaringPotential', 'Потенциал хранения', [number('minYears', 'От, лет', 0, 200, true), number('maxYears', 'До, лет', 0, 200, true), choice('reference', 'Отсчёт срока', [['vintage', 'От урожая'], ['bottling', 'От розлива'], ['purchase', 'От покупки'], ['unspecified', 'Не указан']])]),
  choice('aerationRecommendation', 'Аэрация', [['recommended', 'Рекомендуется'], ['not_recommended', 'Не рекомендуется'], ['optional', 'По желанию']])];
const sparkling: AttributeField[] = [...wine, number('productionYear', 'Год урожая', 1900, 2100, true), choice('vintageStatus', 'Винтаж', [['vintage', 'Год подтверждён'], ['non_vintage', 'Невинтажное'], ['unknown', 'Неизвестно']]), ref('sparklingMethod', 'Метод производства игристого', 'sparkling_method')];
const spirit: AttributeField[] = [...common,
  list('agingStages', 'Стадии выдержки', [number('order', 'Номер стадии', 1, 100, true), choice('purpose', 'Назначение', [['primary', 'Основная'], ['finish', 'Финиш'], ['unspecified', 'Не указано']]), ref('vessel', 'Ёмкость', 'vessel'), ref('wood', 'Древесина', 'wood'), ref('previousContents', 'Предыдущее содержимое бочки', 'previous_contents'), duration]),
  ref('servingTags', 'Способы подачи', 'serving', true), list('sensoryRatings', 'Вкусовые оценки', [ref('dimension', 'Измерение', 'sensory_dimension'), object('rating', 'Оценка', rating)])];
const whisky = object('whiskyDetails', 'Характеристики виски', [ref('whiskyType', 'Тип виски', 'whisky_type'), ref('blendStyle', 'Стиль купажа', 'blend_style'), number('componentCount', 'Число компонентов', 1, 1000, true), number('ageStatementYears', 'Заявленный возраст, лет', 1, 200, true), choice('ageStatementStatus', 'Указание возраста', [['stated', 'Возраст указан'], ['nas', 'NAS'], ['unknown', 'Неизвестно']])]);
const cognac = object('cognacDetails', 'Характеристики коньяка', [ref('ageClassification', 'Классификация выдержки', 'age_classification'), number('ageStatementYears', 'Заявленный возраст, лет', 1, 200, true), ref('originArea', 'Зона происхождения', 'origin_area'), composition, yesNo('grapeCompositionComplete', 'Полный состав')]);
export function getAttributeFields(category: string, subcategory?: string): AttributeField[] {
  if (category === 'wine') return wine;
  if (category === 'champagne_and_sparkling') return sparkling;
  if (category !== 'spirit') return [];
  const subtype = subcategory?.trim().toLowerCase();
  return [...spirit, ...(['виски', 'whisky', 'whiskey'].includes(subtype || '') ? [whisky] : []), ...(['коньяк', 'cognac'].includes(subtype || '') ? [cognac] : [])];
}
/** All persisted fields, including hidden subtype data, for a lossless initial read. */
export function getAllAttributeFields(category: string): AttributeField[] {
  return category === 'spirit' ? [...spirit, whisky, cognac] : getAttributeFields(category);
}
