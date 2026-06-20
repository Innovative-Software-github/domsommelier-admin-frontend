import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getCustomer } from '../../../api/customers/requests';
import type { AdminCustomerDetail } from '../../../api/customers/interfaces';

export function useCustomer(customerId: string | undefined) {
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCustomer(id);
      setCustomer(result);
    } catch (err) {
      let message = 'Не удалось загрузить клиента';
      if (err instanceof ApiHttpError) {
        message = err.status === 403
          ? 'Нет доступа к карточке клиента.'
          : err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      setError('Клиент не найден');
      return;
    }

    void fetchCustomer(customerId);
  }, [fetchCustomer, customerId]);

  return { customer, loading, error };
}
