import { useCallback, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import {
  createWineStore,
  deleteWineStore,
  updateWineStore,
} from '../../../api/wineStores/requests';
import type { WineStore, WineStoreRequestBody } from '../../../api/wineStores/interfaces';

function resolveMutationError(err: unknown, fallback: string): string {
  if (err instanceof ApiHttpError) {
    if (err.status === 403) {
      return 'Нет прав на изменение винотек. Проверьте роль администратора.';
    }
    if (err.status === 409) {
      return err.message || 'Невозможно удалить винотеку: она используется';
    }
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export function useWineStoreMutations() {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (body: WineStoreRequestBody): Promise<WineStore> => {
    setSaving(true);
    try {
      return await createWineStore(body);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось создать винотеку'));
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(async (id: number, body: WineStoreRequestBody): Promise<WineStore> => {
    setSaving(true);
    try {
      return await updateWineStore(id, body);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось обновить винотеку'));
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (id: number): Promise<void> => {
    setSaving(true);
    try {
      await deleteWineStore(id);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось удалить винотеку'));
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, create, update, remove };
}
