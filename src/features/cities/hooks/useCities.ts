import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getAllCities } from '../../../api/cities/requests';
import type { City } from '../../../api/cities/interfaces';

/** Все города (включая скрытые) — для админского списка. */
export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setCities(await getAllCities());
    } catch (err) {
      let message = 'Не удалось загрузить города';
      if (err instanceof ApiHttpError) {
        message = err.status === 403
          ? 'Нет доступа к городам. Проверьте роль администратора и перезайдите в систему.'
          : err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCities();
  }, [fetchCities]);

  return { cities, loading, error, refetch: fetchCities };
}
