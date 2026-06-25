import { customFetch } from '../config/customFetch';
import { uploadWithAuth } from '../config/uploadFetch';
import type { News } from './interfaces';

/** Загрузить или заменить обложку новости. Возвращает обновлённую новость. */
export function uploadNewsCover(newsId: string, file: File): Promise<News> {
  const formData = new FormData();
  formData.append('file', file);

  return uploadWithAuth<News>(
    `/api/v1/news/${encodeURIComponent(newsId)}/cover`,
    formData,
  );
}

/** Удалить обложку новости. Возвращает обновлённую новость. */
export function deleteNewsCover(newsId: string): Promise<News> {
  return customFetch<News>(`/api/v1/news/${newsId}/cover`, {
    method: 'DELETE',
    withAuth: true,
  });
}
