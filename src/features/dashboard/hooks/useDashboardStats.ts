import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getDashboardStats } from '../../../api/dashboard/requests';
import type { AdminDashboardStats } from '../../../api/dashboard/interfaces';

export function useDashboardStats() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDashboardStats();
      setStats(result);
    } catch (err) {
      let message = 'Не удалось загрузить статистику';
      if (err instanceof ApiHttpError) {
        message = err.status === 403
          ? 'Нет доступа к статистике. Проверьте роль администратора и перезайдите в систему.'
          : err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
