import { tokenStorage } from '../../auth/tokenStorage';
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
  const { method = 'GET', body, withAuth = false } = options;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (withAuth) {
    const token = tokenStorage.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_PREFIX}${normalizedPath}`, {
    method: method as HttpMethod,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      handleSessionExpired();
    }

    const errorBody = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = errorBody?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as TResponse;
  }

  return response.json() as Promise<TResponse>;
}
