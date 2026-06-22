import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getEventOrders } from '../../../api/eventOrders/requests';
import type {
  AdminEventOrdersPage,
  EventOrdersQueryParams,
} from '../../../api/eventOrders/interfaces';

const DEFAULT_SIZE = 10;

export function useEventOrders() {
  const [params, setParams] = useState<EventOrdersQueryParams>({ page: 0, size: DEFAULT_SIZE });
  const [page, setPage] = useState<AdminEventOrdersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventOrders = useCallback(async (query: EventOrdersQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getEventOrders(query);
      setPage(result);
    } catch (err) {
      let message = 'Не удалось загрузить заявки';
      if (err instanceof ApiHttpError) {
        message = err.status === 403
          ? 'Нет доступа к заявкам. Проверьте роль администратора и перезайдите в систему.'
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
    void fetchEventOrders(params);
  }, [fetchEventOrders, params]);

  const updateParams = useCallback((patch: Partial<EventOrdersQueryParams>) => {
    setParams((prev) => ({ ...prev, ...patch, page: patch.page ?? 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setParams({ page: 0, size: DEFAULT_SIZE });
  }, []);

  const setPageNumber = useCallback((pageNumber: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: pageNumber, size: pageSize }));
  }, []);

  const refetch = useCallback(() => {
    void fetchEventOrders(params);
  }, [fetchEventOrders, params]);

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
