import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getWineStores } from '../../../api/wineStores/requests';
import type { WineStoresPage, WineStoresQueryParams } from '../../../api/wineStores/interfaces';

const DEFAULT_SIZE = 10;

export function useWineStores() {
  const [params, setParams] = useState<WineStoresQueryParams>({ page: 0, size: DEFAULT_SIZE });
  const [page, setPage] = useState<WineStoresPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWineStores = useCallback(async (query: WineStoresQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getWineStores(query);
      setPage(result);
    } catch (err) {
      let message = 'Не удалось загрузить винотеки';
      if (err instanceof ApiHttpError) {
        message = err.status === 403
          ? 'Нет доступа к винотекам. Проверьте роль администратора и перезайдите в систему.'
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
    void fetchWineStores(params);
  }, [fetchWineStores, params]);

  const updateParams = useCallback((patch: Partial<WineStoresQueryParams>) => {
    setParams((prev) => ({ ...prev, ...patch, page: patch.page ?? 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setParams({ page: 0, size: DEFAULT_SIZE });
  }, []);

  const setPageNumber = useCallback((pageNumber: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: pageNumber, size: pageSize }));
  }, []);

  const refetch = useCallback(() => {
    void fetchWineStores(params);
  }, [fetchWineStores, params]);

  return {
    params,
    page,
    loading,
    error,
    updateParams,
    resetFilters,
    setPageNumber,
    refetch,
  };
}
