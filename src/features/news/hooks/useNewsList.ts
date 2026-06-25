import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getNews } from '../../../api/news/requests';
import type { NewsPage, NewsQueryParams } from '../../../api/news/interfaces';

const DEFAULT_SIZE = 10;

export function useNewsList() {
  const [params, setParams] = useState<NewsQueryParams>({ page: 0, size: DEFAULT_SIZE });
  const [page, setPage] = useState<NewsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (query: NewsQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      setPage(await getNews(query));
    } catch (err) {
      let message = 'Не удалось загрузить новости';
      if (err instanceof ApiHttpError) {
        message = err.status === 403
          ? 'Нет доступа к новостям. Проверьте роль администратора и перезайдите в систему.'
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
    void fetchNews(params);
  }, [fetchNews, params]);

  const setPageNumber = useCallback((pageNumber: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: pageNumber, size: pageSize }));
  }, []);

  const refetch = useCallback(() => {
    void fetchNews(params);
  }, [fetchNews, params]);

  return { params, page, loading, error, setPageNumber, refetch };
}
