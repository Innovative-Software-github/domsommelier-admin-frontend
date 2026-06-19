import { customFetch } from '../config/customFetch';
import type { AuthConfirmResponse, AuthInitiateResponse } from './interfaces';

export function authInitiate(email: string): Promise<AuthInitiateResponse> {
  return customFetch<AuthInitiateResponse>('/api/v1/auth/initiate', {
    method: 'POST',
    body: { email },
  });
}

export function authConfirm(email: string, code: string): Promise<AuthConfirmResponse> {
  return customFetch<AuthConfirmResponse>('/api/v1/auth/confirm', {
    method: 'POST',
    body: { email, code },
  });
}
