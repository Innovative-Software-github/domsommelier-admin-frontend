import { useCallback, useEffect, useState } from 'react';
import { getEventOrder } from '../../../api/eventOrders/requests';
import type { AdminEventOrderDetail } from '../../../api/eventOrders/interfaces';

export function useEventOrder(eventOrderId: string | undefined) {
  const [eventOrder, setEventOrder] = useState<AdminEventOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventOrder = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getEventOrder(id);
      setEventOrder(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить заявку';
      setError(message);
      setEventOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!eventOrderId) {
      setLoading(false);
      setError('Заявка не найдена');
      return;
    }

    void fetchEventOrder(eventOrderId);
  }, [fetchEventOrder, eventOrderId]);

  const refetch = useCallback(() => {
    if (eventOrderId) {
      void fetchEventOrder(eventOrderId);
    }
  }, [fetchEventOrder, eventOrderId]);

  return { eventOrder, loading, error, refetch };
}
