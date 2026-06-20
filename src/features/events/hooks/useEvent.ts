import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getEventById } from '../../../api/events/requests';
import type { EventDetails } from '../../../api/events/interfaces';

export function useEvent(id: string | undefined) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getEventById(eventId);
      setEvent(result);
    } catch (err) {
      let message = 'Не удалось загрузить мероприятие';
      if (err instanceof ApiHttpError) {
        message = err.status === 404
          ? 'Мероприятие не найдено'
          : err.status === 403
            ? 'Нет доступа к мероприятию. Проверьте роль администратора.'
            : err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setEvent(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setEvent(null);
      setLoading(false);
      setError(null);
      return;
    }

    void fetchEvent(id);
  }, [fetchEvent, id]);

  const refetch = useCallback(() => {
    if (id) {
      void fetchEvent(id);
    }
  }, [fetchEvent, id]);

  return { event, loading, error, refetch };
}
