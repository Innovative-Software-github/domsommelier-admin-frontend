import { useCallback, useEffect, useState } from 'react';
import { getProduct } from '../../../api/products/requests';
import { deleteProductPhoto, uploadProductPhotos } from '../../../api/products/photos';
import type { ProductPhoto } from '../../../api/products/interfaces';

export function useProductPhotos(productId: string | undefined) {
  const [photos, setPhotos] = useState<ProductPhoto[]>([]);
  const [loading, setLoading] = useState(Boolean(productId));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const product = await getProduct(id);
      setPhotos(product.productPhoto ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить фото');
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!productId) {
      setPhotos([]);
      setLoading(false);
      return;
    }
    void fetchPhotos(productId);
  }, [productId, fetchPhotos]);

  const upload = useCallback(async (files: File[]) => {
    if (!productId) {
      throw new Error('Сначала сохраните товар');
    }
    setUploading(true);
    setError(null);
    try {
      await uploadProductPhotos(productId, files);
      await fetchPhotos(productId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить фото';
      setError(message);
      throw new Error(message);
    } finally {
      setUploading(false);
    }
  }, [productId, fetchPhotos]);

  const remove = useCallback(async (photoId: string) => {
    setError(null);
    try {
      await deleteProductPhoto(photoId);
      setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить фото';
      setError(message);
      throw new Error(message);
    }
  }, []);

  return { photos, loading, uploading, error, upload, remove };
}
