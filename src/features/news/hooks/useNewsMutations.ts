import { useCallback, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { createNews, deleteNews, updateNews } from '../../../api/news/requests';
import type { News, NewsRequestBody } from '../../../api/news/interfaces';

function resolveMutationError(err: unknown, fallback: string): string {
  if (err instanceof ApiHttpError) {
    if (err.status === 403) {
      return 'Нет прав на изменение новостей. Проверьте роль администратора.';
    }
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export function useNewsMutations() {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (body: NewsRequestBody): Promise<News> => {
    setSaving(true);
    try {
      return await createNews(body);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось создать новость'));
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(async (id: string, body: NewsRequestBody): Promise<News> => {
    setSaving(true);
    try {
      return await updateNews(id, body);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось обновить новость'));
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    setSaving(true);
    try {
      await deleteNews(id);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось удалить новость'));
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, create, update, remove };
}
