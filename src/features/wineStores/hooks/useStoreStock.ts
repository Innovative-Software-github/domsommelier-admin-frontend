import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getStoreStock } from '../../../api/wineStores/requests';
import type { StoreStockPage, StoreStockQueryParams } from '../../../api/wineStores/interfaces';

const DEFAULT_SIZE = 20;

export function useStoreStock(storeId: number | null) {
  const [params, setParams] = useState<StoreStockQueryParams>({ page: 0, size: DEFAULT_SIZE });
  const [page, setPage] = useState<StoreStockPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = useCallback(async (id: number, query: StoreStockQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      setPage(await getStoreStock(id, query));
    } catch (err) {
      let message = 'Не удалось загрузить склад винотеки';
      if (err instanceof ApiHttpError) {
        message = err.status === 403
          ? 'Нет доступа к складу. Проверьте роль администратора и перезайдите в систему.'
          : err.status === 404
            ? 'Винотека не найдена'
            : err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      setPage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (storeId === null) {
      setPage(null);
      setLoading(false);
      return;
    }
    void fetchStock(storeId, params);
  }, [fetchStock, storeId, params]);

  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search: search || undefined, page: 0 }));
  }, []);

  const setPageNumber = useCallback((pageNumber: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: pageNumber, size: pageSize }));
  }, []);

  /** Локально обновляет остаток в уже загруженной странице — без перезапроса. */
  const patchQuantity = useCallback((productId: string, quantity: number) => {
    setPage((prev) =>
      prev
        ? {
            ...prev,
            content: prev.content.map((item) =>
              item.productId === productId ? { ...item, quantity } : item,
            ),
          }
        : prev,
    );
  }, []);

  return { params, page, loading, error, setSearch, setPageNumber, patchQuantity };
}
