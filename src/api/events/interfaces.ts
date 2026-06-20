import type { Page } from '../config/page';

export type EventType = 'wineCasino' | 'degustation';

export interface EventListItem {
  id: string;
  type: EventType;
  price: number;
  dateTime: string;
  title: string;
  smallCover: string;
  city: string;
  wineStoreId: number | null;
  wineStoreName: string | null;
}

export interface EventDetails extends EventListItem {
  largeCover: string;
  address: string;
  description: string;
  registrationLink: string;
}

export interface EventRequestBody {
  type: EventType;
  price: number;
  datetime: string;
  title: string;
  wineStoreId: number;
  smallCover?: string;
  largeCover?: string;
  description?: string;
  registrationLink?: string;
}

export interface EventsQueryParams {
  page?: number;
  size?: number;
  dateStart?: string;
  dateEnd?: string;
  priceMin?: number;
  priceMax?: number;
  type?: EventType;
  wineStoreId?: number;
}

export interface EventWriteResponse {
  id: string;
  type: EventType;
  price: number;
  datetime: string;
  title: string;
  wineStoreId: number;
  smallCover?: string;
  largeCover?: string;
  city?: string;
  address?: string;
  description?: string;
  registrationLink?: string;
}

export type EventsPage = Page<EventListItem>;

export interface EventPhoto {
  id: string;
  eventId: string;
  name: string;
  description: string;
  bucket?: string;
  url: string;
}
