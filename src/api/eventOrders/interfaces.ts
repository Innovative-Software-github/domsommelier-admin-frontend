import type { Page } from '../config/page';

export interface AdminEventOrderListItem {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  statusName: string;
}

export interface AdminEventOrderDetail {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  comment: string | null;
  statusName: string;
}

export interface EventOrdersQueryParams {
  page?: number;
  size?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  query?: string;
}

export interface UpdateEventOrderStatusBody {
  status: string;
}

export type AdminEventOrdersPage = Page<AdminEventOrderListItem>;
