import { customFetch } from '../config/customFetch';
import { uploadWithAuth } from '../config/uploadFetch';

export function uploadProductPhotos(productId: string, files: File[]): Promise<void> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return uploadWithAuth<void>(
    `/products/files/upload?productId=${encodeURIComponent(productId)}`,
    formData,
  );
}

export function deleteProductPhoto(photoId: string): Promise<void> {
  return customFetch<void>(`/products/files/${photoId}`, {
    method: 'DELETE',
    withAuth: true,
  });
}

/**
 * URL превью фото (публичный GET download-эндпоинт).
 * Объект в MinIO лежит под ключом `productId/имя`, поэтому передаём полный ключ.
 */
export function getProductPhotoUrl(productId: string, fileName: string): string {
  return `/api-back/products/files?file=${encodeURIComponent(`${productId}/${fileName}`)}`;
}
