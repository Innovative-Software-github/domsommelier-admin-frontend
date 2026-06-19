import { customFetch } from '../config/customFetch';
import type { QueryParamValue } from '../config/interfaces';
import type {
  AdminOrderDetail,
  AdminOrdersPage,
  OrderStatusOption,
  OrdersQueryParams,
  UpdateOrderStatusBody,
} from './interfaces';

export function getOrders(params: OrdersQueryParams = {}): Promise<AdminOrdersPage> {
  return customFetch<AdminOrdersPage>('/api/v1/admin/orders', {
    withAuth: true,
    params: params as Record<string, QueryParamValue>,
  });
}

export function getOrder(id: string): Promise<AdminOrderDetail> {
  return customFetch<AdminOrderDetail>(`/api/v1/admin/orders/${id}`, {
    withAuth: true,
  });
}

export function getOrderStatuses(): Promise<OrderStatusOption[]> {
  return customFetch<OrderStatusOption[]>('/api/v1/admin/order-statuses', {
    withAuth: true,
  });
}

export function updateOrderStatus(id: string, status: string): Promise<AdminOrderDetail> {
  const body: UpdateOrderStatusBody = { status };
  return customFetch<AdminOrderDetail>(`/api/v1/admin/orders/${id}/status`, {
    method: 'PATCH',
    body,
    withAuth: true,
  });
}

export function cancelOrder(id: string): Promise<{ status: string }> {
  return customFetch<{ status: string }>(`/api/v1/admin/orders/${id}/cancel`, {
    method: 'POST',
    withAuth: true,
  });
}
