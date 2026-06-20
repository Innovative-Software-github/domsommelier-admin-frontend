import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getEvents } from '../../../api/events/requests';
import type { EventsPage, EventsQueryParams } from '../../../api/events/interfaces';

const DEFAULT_SIZE = 10;

export function useEvents() {
  const [params, setParams] = useState<EventsQueryParams>({ page: 0, size: DEFAULT_SIZE });
  const [page, setPage] = useState<EventsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (query: EventsQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getEvents(query);
      setPage(result);
    } catch (err) {
      let message = 'Не удалось загрузить мероприятия';
      if (err instanceof ApiHttpError) {
        message = err.status === 403
          ? 'Нет доступа к мероприятиям. Проверьте роль администратора и перезайдите в систему.'
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
    void fetchEvents(params);
  }, [fetchEvents, params]);

  const updateParams = useCallback((patch: Partial<EventsQueryParams>) => {
    setParams((prev) => ({ ...prev, ...patch, page: patch.page ?? 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setParams({ page: 0, size: DEFAULT_SIZE });
  }, []);

  const setPageNumber = useCallback((pageNumber: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: pageNumber, size: pageSize }));
  }, []);

  const refetch = useCallback(() => {
    void fetchEvents(params);
  }, [fetchEvents, params]);

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
