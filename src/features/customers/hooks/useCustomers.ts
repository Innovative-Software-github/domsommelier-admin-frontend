import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getCustomers } from '../../../api/customers/requests';
import type { AdminCustomersPage, CustomersQueryParams } from '../../../api/customers/interfaces';

const DEFAULT_SIZE = 10;

export function useCustomers() {
  const [params, setParams] = useState<CustomersQueryParams>({ page: 0, size: DEFAULT_SIZE });
  const [page, setPage] = useState<AdminCustomersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async (query: CustomersQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCustomers(query);
      setPage(result);
    } catch (err) {
      let message = 'Не удалось загрузить клиентов';
      if (err instanceof ApiHttpError) {
        message = err.status === 403
          ? 'Нет доступа к клиентам. Проверьте роль администратора и перезайдите в систему.'
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
    void fetchCustomers(params);
  }, [fetchCustomers, params]);

  const updateParams = useCallback((patch: Partial<CustomersQueryParams>) => {
    setParams((prev) => ({ ...prev, ...patch, page: patch.page ?? 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setParams({ page: 0, size: DEFAULT_SIZE });
  }, []);

  const setPageNumber = useCallback((pageNumber: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: pageNumber, size: pageSize }));
  }, []);

  return {
    params,
    page,
    loading,
    error,
    updateParams,
    resetFilters,
    setPageNumber,
  };
}
