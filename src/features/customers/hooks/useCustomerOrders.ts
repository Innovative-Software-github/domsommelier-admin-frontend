import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getCustomerOrders } from '../../../api/customers/requests';
import type { AdminCustomerOrdersPage, CustomerOrdersQueryParams } from '../../../api/customers/interfaces';

const DEFAULT_SIZE = 10;

export function useCustomerOrders(customerId: string | undefined) {
  const [params, setParams] = useState<CustomerOrdersQueryParams>({ page: 0, size: DEFAULT_SIZE });
  const [page, setPage] = useState<AdminCustomerOrdersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (id: string, query: CustomerOrdersQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCustomerOrders(id, query);
      setPage(result);
    } catch (err) {
      let message = 'Не удалось загрузить заказы клиента';
      if (err instanceof ApiHttpError) {
        message = err.message;
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
    if (!customerId) {
      setLoading(false);
      return;
    }

    void fetchOrders(customerId, params);
  }, [fetchOrders, customerId, params]);

  const setPageNumber = useCallback((pageNumber: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: pageNumber, size: pageSize }));
  }, []);

  return {
    page,
    loading,
    error,
    setPageNumber,
  };
}
