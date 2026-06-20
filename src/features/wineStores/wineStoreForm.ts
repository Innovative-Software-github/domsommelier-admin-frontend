import type { Rule } from 'antd/es/form';
import type { WineStore, WineStoreRequestBody } from '../../api/wineStores/interfaces';

export interface WineStoreFormValues {
  name: string;
  address?: string;
  phone?: string;
  workingHours?: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
}

export const DEFAULT_MAP_CENTER = {
  latitude: 55.76,
  longitude: 37.6,
} as const;

export const DEFAULT_FORM_VALUES: WineStoreFormValues = {
  name: '',
  address: '',
  phone: '',
  workingHours: '',
  city: '',
  district: '',
  latitude: DEFAULT_MAP_CENTER.latitude,
  longitude: DEFAULT_MAP_CENTER.longitude,
};

export const WINE_STORE_FORM_RULES: Record<keyof WineStoreFormValues, Rule[]> = {
  name: [{ required: true, message: 'Укажите название' }],
  address: [],
  phone: [],
  workingHours: [],
  city: [{ required: true, message: 'Укажите город' }],
  district: [{ required: true, message: 'Укажите район' }],
  latitude: [
    { required: true, message: 'Укажите широту' },
    { type: 'number', min: -90, max: 90, message: 'Широта от -90 до 90' },
  ],
  longitude: [
    { required: true, message: 'Укажите долготу' },
    { type: 'number', min: -180, max: 180, message: 'Долгота от -180 до 180' },
  ],
};

function normalizeLocationText(value: string): string {
  return value.trim().toLowerCase();
}

function trimToUndefined(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function toFormValues(store: WineStore): WineStoreFormValues {
  return {
    name: store.name,
    address: store.address ?? undefined,
    phone: store.phone ?? undefined,
    workingHours: store.workingHours ?? undefined,
    city: store.city,
    district: store.district,
    latitude: store.location.latitude,
    longitude: store.location.longitude,
  };
}

export function toRequestBody(values: WineStoreFormValues): WineStoreRequestBody {
  return {
    name: values.name.trim(),
    address: trimToUndefined(values.address),
    phone: trimToUndefined(values.phone),
    workingHours: trimToUndefined(values.workingHours),
    city: normalizeLocationText(values.city),
    district: normalizeLocationText(values.district),
    latitude: values.latitude,
    longitude: values.longitude,
  };
}

export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}
