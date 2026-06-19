import { customFetch } from '../config/customFetch';
import type { WineStoresPage } from './interfaces';

export function getWineStores(page = 0, size = 100): Promise<WineStoresPage> {
  return customFetch<WineStoresPage>('/api/v1/wine-stores', {
    params: { page, size },
  });
}
