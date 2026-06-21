import { useCallback, useEffect, useState } from 'react';
import { getProductReference } from '../../../api/products/requests';
import type { ProductCategory, ProductReference } from '../../../api/products/interfaces';

const EMPTY: ProductReference = {
  countries: [],
  colors: [],
  types: [],
  subcategories: [],
  sugarContents: [],
};

export function useProductReference(category: ProductCategory) {
  const [reference, setReference] = useState<ProductReference>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReference = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReference(await getProductReference(category));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить справочники');
      setReference(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void fetchReference();
  }, [fetchReference]);

  return { reference, loading, error };
}
