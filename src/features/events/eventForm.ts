import type { Rule } from 'antd/es/form';
import dayjs, { type Dayjs } from 'dayjs';
import type { EventDetails, EventRequestBody, EventType } from '../../api/events/interfaces';

export interface EventFormValues {
  type: EventType;
  title: string;
  price: number;
  datetime: Dayjs;
  wineStoreId?: number;
  description?: string;
  registrationLink?: string;
  smallCover?: string;
  largeCover?: string;
}

export const DEFAULT_FORM_VALUES: EventFormValues = {
  type: 'degustation',
  title: '',
  price: 0,
  datetime: dayjs().add(7, 'day').hour(18).minute(0).second(0).millisecond(0),
  wineStoreId: undefined,
  description: '',
  registrationLink: '',
  smallCover: '',
  largeCover: '',
};

export const EVENT_FORM_RULES: Record<keyof EventFormValues, Rule[]> = {
  type: [{ required: true, message: 'Выберите тип' }],
  title: [{ required: true, message: 'Укажите название' }],
  price: [
    { required: true, message: 'Укажите цену' },
    { type: 'number', min: 0, message: 'Цена не может быть отрицательной' },
  ],
  datetime: [{ required: true, message: 'Укажите дату и время' }],
  wineStoreId: [{ required: true, message: 'Выберите винотеку' }],
  description: [],
  registrationLink: [
    { type: 'url', message: 'Укажите корректную ссылку' },
  ],
  smallCover: [],
  largeCover: [],
};

function trimToUndefined(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function toFormValues(event: EventDetails): EventFormValues {
  return {
    type: event.type,
    title: event.title,
    price: event.price,
    datetime: dayjs(event.dateTime),
    wineStoreId: event.wineStoreId ?? undefined,
    description: event.description || undefined,
    registrationLink: event.registrationLink || undefined,
    smallCover: event.smallCover || undefined,
    largeCover: event.largeCover || undefined,
  };
}

export function toRequestBody(values: EventFormValues): EventRequestBody {
  if (values.wineStoreId == null) {
    throw new Error('Выберите винотеку');
  }

  return {
    type: values.type,
    title: values.title.trim(),
    price: values.price,
    datetime: values.datetime.toISOString(),
    wineStoreId: values.wineStoreId,
    description: trimToUndefined(values.description),
    registrationLink: trimToUndefined(values.registrationLink),
    smallCover: trimToUndefined(values.smallCover),
    largeCover: trimToUndefined(values.largeCover),
  };
}
