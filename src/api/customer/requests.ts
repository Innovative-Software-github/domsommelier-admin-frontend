import { customFetch } from '../config/customFetch';
import type { CustomerProfile } from './interfaces';

export function getProfile(): Promise<CustomerProfile> {
  return customFetch<CustomerProfile>('/customer/profile', {
    method: 'GET',
    withAuth: true,
  });
}
