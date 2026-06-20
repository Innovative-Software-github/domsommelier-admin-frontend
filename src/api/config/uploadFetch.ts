import { tokenStorage } from '../../auth/tokenStorage';
import { ApiHttpError } from './errors';
import type { ApiErrorBody } from './interfaces';

const API_PREFIX = '/api-back';

function handleSessionExpired(): void {
  tokenStorage.removeToken();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export async function uploadWithAuth<TResponse>(
  path: string,
  formData: FormData,
): Promise<TResponse> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const token = tokenStorage.getToken();

  if (!token) {
    handleSessionExpired();
    throw new ApiHttpError('Требуется авторизация', 401);
  }

  const response = await fetch(`${API_PREFIX}${normalizedPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = errorBody?.message || `Request failed with status ${response.status}`;

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
