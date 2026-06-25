import { customFetch } from '../config/customFetch';
import type { QueryParamValue } from '../config/interfaces';
import type { News, NewsPage, NewsQueryParams, NewsRequestBody } from './interfaces';

export function getNews(params: NewsQueryParams = {}): Promise<NewsPage> {
  return customFetch<NewsPage>('/api/v1/news', {
    withAuth: true,
    params: params as Record<string, QueryParamValue>,
  });
}

export function getNewsById(id: string): Promise<News> {
  return customFetch<News>(`/api/v1/news/${id}`, { withAuth: true });
}

export function createNews(body: NewsRequestBody): Promise<News> {
  return customFetch<News>('/api/v1/news', {
    method: 'POST',
    body,
    withAuth: true,
  });
}

export function updateNews(id: string, body: NewsRequestBody): Promise<News> {
  return customFetch<News>(`/api/v1/news/${id}`, {
    method: 'PUT',
    body,
    withAuth: true,
  });
}

export function deleteNews(id: string): Promise<void> {
  return customFetch<void>(`/api/v1/news/${id}`, {
    method: 'DELETE',
    withAuth: true,
  });
}
