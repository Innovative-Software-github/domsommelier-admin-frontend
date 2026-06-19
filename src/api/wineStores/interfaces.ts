import type { Page } from '../config/page';

export interface WineStore {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  workingHours: string | null;
  city: string;
  district: string;
}

export type WineStoresPage = Page<WineStore>;
