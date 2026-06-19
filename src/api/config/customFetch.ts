import { tokenStorage } from '../../auth/tokenStorage';
import { ApiHttpError } from './errors';
import { buildQueryString } from './query';
import type { ApiErrorBody, CustomFetchOptions, HttpMethod } from './interfaces';

const API_PREFIX = '/api-back';

function handleSessionExpired(): void {
  tokenStorage.removeToken();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export async function customFetch<TResponse>(
  path: string,
  options: CustomFetchOptions = {},
): Promise<TResponse> {
  const { method = 'GET', body, withAuth = false, params } = options;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const query = params ? buildQueryString(params) : '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (withAuth) {
    const token = tokenStorage.getToken();
    if (!token) {
      handleSessionExpired();
      throw new ApiHttpError('Требуется авторизация', 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_PREFIX}${normalizedPath}${query}`, {
    method: method as HttpMethod,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = errorBody?.message || `Request failed with status ${response.status}`;

    // 401 — сессия истекла или токен недействителен.
    // 403 — отказ в доступе (не admin, нет прав); не разлогиниваем.
    if (response.status === 401) {
      handleSessionExpired();
    }

    throw new ApiHttpError(message, response.status);
  }

  if (response.status === 204) {
    return null as TResponse;
  }

  return response.json() as Promise<TResponse>;
}
