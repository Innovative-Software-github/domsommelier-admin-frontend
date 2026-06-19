import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getOrders } from '../../../api/orders/requests';
import type { AdminOrdersPage, OrdersQueryParams } from '../../../api/orders/interfaces';

const DEFAULT_SIZE = 10;

export function useOrders() {
  const [params, setParams] = useState<OrdersQueryParams>({ page: 0, size: DEFAULT_SIZE });
  const [page, setPage] = useState<AdminOrdersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (query: OrdersQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getOrders(query);
      setPage(result);
    } catch (err) {
      let message = 'Не удалось загрузить заказы';
      if (err instanceof ApiHttpError) {
        message = err.status === 403
          ? 'Нет доступа к заказам. Проверьте роль администратора и перезайдите в систему.'
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
    void fetchOrders(params);
  }, [fetchOrders, params]);

  const updateParams = useCallback((patch: Partial<OrdersQueryParams>) => {
    setParams((prev) => ({ ...prev, ...patch, page: patch.page ?? 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setParams({ page: 0, size: DEFAULT_SIZE });
  }, []);

  const setPageNumber = useCallback((pageNumber: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: pageNumber, size: pageSize }));
  }, []);

  const refetch = useCallback(() => {
    void fetchOrders(params);
  }, [fetchOrders, params]);

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
