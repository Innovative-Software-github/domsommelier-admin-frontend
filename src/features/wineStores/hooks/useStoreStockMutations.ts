import { useCallback, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { updateStoreStock } from '../../../api/wineStores/requests';
import type { StoreStockItem } from '../../../api/wineStores/interfaces';

function resolveMutationError(err: unknown, fallback: string): string {
  if (err instanceof ApiHttpError) {
    if (err.status === 403) {
      return 'Нет прав на изменение склада. Проверьте роль администратора.';
    }
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export function useStoreStockMutations() {
  const [savingId, setSavingId] = useState<string | null>(null);

  const setStock = useCallback(
    async (storeId: number, productId: string, quantity: number): Promise<StoreStockItem> => {
      setSavingId(productId);
      try {
        return await updateStoreStock(storeId, productId, quantity);
      } catch (err) {
        throw new Error(resolveMutationError(err, 'Не удалось сохранить остаток'));
      } finally {
        setSavingId(null);
      }
    },
    [],
  );

  return { savingId, setStock };
}
