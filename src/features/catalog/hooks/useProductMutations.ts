import { useCallback, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { createProduct, deleteProduct, updateProduct } from '../../../api/products/requests';
import type { ProductDetail, ProductWriteRequest } from '../../../api/products/interfaces';

function resolveMutationError(err: unknown, fallback: string): string {
  if (err instanceof ApiHttpError) {
    if (err.status === 403) {
      return 'Нет прав на изменение товаров. Проверьте роль администратора.';
    }
    if (err.status === 409) {
      return err.message || 'Нельзя удалить товар: на него есть заказы';
    }
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export function useProductMutations() {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (body: ProductWriteRequest): Promise<ProductDetail> => {
    setSaving(true);
    try {
      return await createProduct(body);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось создать товар'));
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, body: ProductWriteRequest): Promise<ProductDetail> => {
      setSaving(true);
      try {
        return await updateProduct(id, body);
      } catch (err) {
        throw new Error(resolveMutationError(err, 'Не удалось обновить товар'));
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const remove = useCallback(async (id: string): Promise<void> => {
    setSaving(true);
    try {
      await deleteProduct(id);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось удалить товар'));
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, create, update, remove };
}
