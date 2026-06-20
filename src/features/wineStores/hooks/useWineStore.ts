import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getWineStoreById } from '../../../api/wineStores/requests';
import type { WineStore } from '../../../api/wineStores/interfaces';

export function useWineStore(id: string | undefined) {
  const [wineStore, setWineStore] = useState<WineStore | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const fetchWineStore = useCallback(async (storeId: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getWineStoreById(storeId);
      setWineStore(result);
    } catch (err) {
      let message = 'Не удалось загрузить винотеку';
      if (err instanceof ApiHttpError) {
        message = err.status === 404
          ? 'Винотека не найдена'
          : err.status === 403
            ? 'Нет доступа к винотеке. Проверьте роль администратора.'
            : err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setWineStore(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setWineStore(null);
      setLoading(false);
      setError(null);
      return;
    }

    const parsedId = Number(id);
    if (!Number.isFinite(parsedId)) {
      setWineStore(null);
      setLoading(false);
      setError('Некорректный идентификатор винотеки');
      return;
    }

    void fetchWineStore(parsedId);
  }, [fetchWineStore, id]);

  const refetch = useCallback(() => {
    if (!id) {
      return;
    }
    const parsedId = Number(id);
    if (Number.isFinite(parsedId)) {
      void fetchWineStore(parsedId);
    }
  }, [fetchWineStore, id]);

  return { wineStore, loading, error, refetch };
}
