import { useCallback, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { createCity, deleteCity, updateCity } from '../../../api/cities/requests';
import type { City, CityRequestBody } from '../../../api/cities/interfaces';

function resolveMutationError(err: unknown, fallback: string): string {
  if (err instanceof ApiHttpError) {
    if (err.status === 403) {
      return 'Нет прав на изменение городов. Проверьте роль администратора.';
    }
    if (err.status === 409) {
      return err.message || 'Город с таким slug уже существует';
    }
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export function useCityMutations() {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (body: CityRequestBody): Promise<City> => {
    setSaving(true);
    try {
      return await createCity(body);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось создать город'));
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(async (id: number, body: CityRequestBody): Promise<City> => {
    setSaving(true);
    try {
      return await updateCity(id, body);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось обновить город'));
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (id: number): Promise<void> => {
    setSaving(true);
    try {
      await deleteCity(id);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось удалить город'));
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, create, update, remove };
}
