import { useCallback, useEffect, useState } from 'react';
import { getOrder } from '../../../api/orders/requests';
import type { AdminOrderDetail } from '../../../api/orders/interfaces';

export function useOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getOrder(id);
      setOrder(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить заказ';
      setError(message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError('Заказ не найден');
      return;
    }

    void fetchOrder(orderId);
  }, [fetchOrder, orderId]);

  const refetch = useCallback(() => {
    if (orderId) {
      void fetchOrder(orderId);
    }
  }, [fetchOrder, orderId]);

  return { order, loading, error, refetch };
}
