import { useCallback, useEffect, useState } from 'react';
import { getActiveCities } from '../../../api/cities/requests';
import type { City } from '../../../api/cities/interfaces';

/** Активные города — для выпадающих списков (форма винотеки и т.п.). */
export function useActiveCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setCities(await getActiveCities());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить города');
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCities();
  }, [fetchCities]);

  return { cities, loading, error };
}
