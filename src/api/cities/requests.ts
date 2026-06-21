import { customFetch } from '../config/customFetch';
import type { City, CityRequestBody } from './interfaces';

/** Активные города (для выпадающих списков, напр. в форме винотеки). */
export function getActiveCities(): Promise<City[]> {
  return customFetch<City[]>('/api/v1/cities', { withAuth: true });
}

/** Все города, включая скрытые (для админского списка). */
export function getAllCities(): Promise<City[]> {
  return customFetch<City[]>('/api/v1/cities/all', { withAuth: true });
}

export function createCity(body: CityRequestBody): Promise<City> {
  return customFetch<City>('/api/v1/cities', {
    method: 'POST',
    body,
    withAuth: true,
  });
}

export function updateCity(id: number, body: CityRequestBody): Promise<City> {
  return customFetch<City>(`/api/v1/cities/${id}`, {
    method: 'PUT',
    body,
    withAuth: true,
  });
}

export function deleteCity(id: number): Promise<void> {
  return customFetch<void>(`/api/v1/cities/${id}`, {
    method: 'DELETE',
    withAuth: true,
  });
}
