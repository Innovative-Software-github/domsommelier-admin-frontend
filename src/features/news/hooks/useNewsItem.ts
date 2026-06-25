import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getNewsById } from '../../../api/news/requests';
import type { News } from '../../../api/news/interfaces';

/** Загрузка одной новости (для формы редактирования). */
export function useNewsItem(id: string | undefined) {
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (newsId: string) => {
    setLoading(true);
    setError(null);

    try {
      setNews(await getNewsById(newsId));
    } catch (err) {
      let message = 'Не удалось загрузить новость';
      if (err instanceof ApiHttpError) {
        message = err.status === 404 ? 'Новость не найдена' : err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setNews(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setNews(null);
      setLoading(false);
      setError(null);
      return;
    }

    void fetchNews(id);
  }, [id, fetchNews]);

  return { news, loading, error };
}
