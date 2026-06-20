import type { Page } from '../config/page';

export interface WineStoreCoordinates {
  longitude: number;
  latitude: number;
}

export interface WineStore {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  workingHours: string | null;
  city: string;
  district: string;
  location: WineStoreCoordinates;
}

export interface WineStoreRequestBody {
  name: string;
  address?: string;
  phone?: string;
  workingHours?: string;
  city: string;
  district: string;
  longitude: number;
  latitude: number;
}

export interface WineStoresQueryParams {
  page?: number;
  size?: number;
  city?: string;
  district?: string;
}

export type WineStoresPage = Page<WineStore>;
