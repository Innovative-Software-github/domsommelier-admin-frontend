import { customFetch } from '../config/customFetch';
import type { QueryParamValue } from '../config/interfaces';
import type {
  ProductCategory,
  ProductDetail,
  ProductReference,
  ProductWriteRequest,
  ProductsPage,
  ProductsQueryParams,
} from './interfaces';

export function getProducts(params: ProductsQueryParams): Promise<ProductsPage> {
  return customFetch<ProductsPage>('/api/v1/admin/products', {
    withAuth: true,
    params: params as unknown as Record<string, QueryParamValue>,
  });
}

/** Деталь товара — публичный read-эндпоинт (используется для префилла формы). */
export function getProduct(id: string): Promise<ProductDetail> {
  return customFetch<ProductDetail>('/api/v1/products', {
    params: { id },
  });
}

export function getProductReference(category: ProductCategory): Promise<ProductReference> {
  return customFetch<ProductReference>(`/api/v1/admin/products/${category}/reference`, {
    withAuth: true,
  });
}

export function createProduct(body: ProductWriteRequest): Promise<ProductDetail> {
  return customFetch<ProductDetail>('/api/v1/admin/products', {
    method: 'POST',
    body,
    withAuth: true,
  });
}

export function updateProduct(id: string, body: ProductWriteRequest): Promise<ProductDetail> {
  return customFetch<ProductDetail>(`/api/v1/admin/products/${id}`, {
    method: 'PUT',
    body,
    withAuth: true,
  });
}

export function deleteProduct(id: string): Promise<void> {
  return customFetch<void>(`/api/v1/admin/products/${id}`, {
    method: 'DELETE',
    withAuth: true,
  });
}
