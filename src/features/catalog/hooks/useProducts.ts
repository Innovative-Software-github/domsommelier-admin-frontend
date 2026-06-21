import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import { getProducts } from '../../../api/products/requests';
import type {
  ProductCategory,
  ProductsPage,
  ProductsQueryParams,
} from '../../../api/products/interfaces';

const DEFAULT_SIZE = 20;

export function useProducts(category: ProductCategory) {
  const [params, setParams] = useState<ProductsQueryParams>({
    category,
    page: 0,
    size: DEFAULT_SIZE,
  });
  const [page, setPage] = useState<ProductsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Смена категории — сброс пагинации и поиска.
  useEffect(() => {
    setParams({ category, page: 0, size: DEFAULT_SIZE });
  }, [category]);

  const fetchProducts = useCallback(async (query: ProductsQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      setPage(await getProducts(query));
    } catch (err) {
      let message = 'Не удалось загрузить товары';
      if (err instanceof ApiHttpError) {
        message = err.status === 403
          ? 'Нет доступа к товарам. Проверьте роль администратора и перезайдите в систему.'
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
    void fetchProducts(params);
  }, [fetchProducts, params]);

  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search: search || undefined, page: 0 }));
  }, []);

  const setPageNumber = useCallback((pageNumber: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: pageNumber, size: pageSize }));
  }, []);

  const refetch = useCallback(() => {
    void fetchProducts(params);
  }, [fetchProducts, params]);

  return { params, page, loading, error, setSearch, setPageNumber, refetch };
}
