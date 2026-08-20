import { customFetch } from '../config/customFetch';
import type { AdminDashboardStats } from './interfaces';

export function getDashboardStats(): Promise<AdminDashboardStats> {
  return customFetch<AdminDashboardStats>('/api/v1/admin/stats', {
    withAuth: true,
  });
}
