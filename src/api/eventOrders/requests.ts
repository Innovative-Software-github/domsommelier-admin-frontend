import { customFetch } from '../config/customFetch';
import type { QueryParamValue } from '../config/interfaces';
import type {
  AdminEventOrderDetail,
  AdminEventOrdersPage,
  EventOrdersQueryParams,
  UpdateEventOrderStatusBody,
} from './interfaces';

export function getEventOrders(
  params: EventOrdersQueryParams = {},
): Promise<AdminEventOrdersPage> {
  return customFetch<AdminEventOrdersPage>('/api/v1/admin/event-orders', {
    withAuth: true,
    params: params as Record<string, QueryParamValue>,
  });
}

export function getEventOrder(id: string): Promise<AdminEventOrderDetail> {
  return customFetch<AdminEventOrderDetail>(`/api/v1/admin/event-orders/${id}`, {
    withAuth: true,
  });
}

export function updateEventOrderStatus(
  id: string,
  status: string,
): Promise<AdminEventOrderDetail> {
  const body: UpdateEventOrderStatusBody = { status };
  return customFetch<AdminEventOrderDetail>(`/api/v1/admin/event-orders/${id}/status`, {
    method: 'PATCH',
    body,
    withAuth: true,
  });
}
