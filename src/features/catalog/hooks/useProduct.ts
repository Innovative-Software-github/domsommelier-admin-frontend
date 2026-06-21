import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getProduct } from '../../../api/products/requests';
import type { ProductDetail } from '../../../api/products/interfaces';

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      setProduct(await getProduct(productId));
    } catch (err) {
      let message = 'Не удалось загрузить товар';
      if (err instanceof ApiHttpError) {
        message = err.status === 404 ? 'Товар не найден' : err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setProduct(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      setError(null);
      return;
    }
    void fetchProduct(id);
  }, [fetchProduct, id]);

  return { product, loading, error };
}
