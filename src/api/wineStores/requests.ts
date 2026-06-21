import { customFetch } from '../config/customFetch';
import type { QueryParamValue } from '../config/interfaces';
import type {
  StoreStockItem,
  StoreStockPage,
  StoreStockQueryParams,
  WineStore,
  WineStoreRequestBody,
  WineStoresPage,
  WineStoresQueryParams,
} from './interfaces';

export function getWineStores(params: WineStoresQueryParams = {}): Promise<WineStoresPage> {
  return customFetch<WineStoresPage>('/api/v1/wine-stores', {
    withAuth: true,
    params: params as Record<string, QueryParamValue>,
  });
}

export function getWineStoreById(id: number): Promise<WineStore> {
  return customFetch<WineStore>(`/api/v1/wine-stores/${id}`, {
    withAuth: true,
  });
}

export function createWineStore(body: WineStoreRequestBody): Promise<WineStore> {
  return customFetch<WineStore>('/api/v1/wine-stores', {
    method: 'POST',
    body,
    withAuth: true,
  });
}

export function updateWineStore(id: number, body: WineStoreRequestBody): Promise<WineStore> {
  return customFetch<WineStore>(`/api/v1/wine-stores/${id}`, {
    method: 'PUT',
    body,
    withAuth: true,
  });
}

export function deleteWineStore(id: number): Promise<void> {
  return customFetch<void>(`/api/v1/wine-stores/${id}`, {
    method: 'DELETE',
    withAuth: true,
  });
}

export function getStoreStock(
  storeId: number,
  params: StoreStockQueryParams = {},
): Promise<StoreStockPage> {
  return customFetch<StoreStockPage>(`/api/v1/admin/wine-stores/${storeId}/stock`, {
    withAuth: true,
    params: params as Record<string, QueryParamValue>,
  });
}

export function updateStoreStock(
  storeId: number,
  productId: string,
  quantity: number,
): Promise<StoreStockItem> {
  return customFetch<StoreStockItem>(
    `/api/v1/admin/wine-stores/${storeId}/stock/${productId}`,
    {
      method: 'PUT',
      body: { quantity },
      withAuth: true,
    },
  );
}
