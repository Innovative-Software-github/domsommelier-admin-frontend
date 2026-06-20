import { customFetch } from '../config/customFetch';
import type { QueryParamValue } from '../config/interfaces';
import type {
  AdminCustomerDetail,
  AdminCustomerOrdersPage,
  AdminCustomersPage,
  CustomerOrdersQueryParams,
  CustomersQueryParams,
} from './interfaces';

export function getCustomers(params: CustomersQueryParams = {}): Promise<AdminCustomersPage> {
  return customFetch<AdminCustomersPage>('/api/v1/admin/customers', {
    withAuth: true,
    params: params as Record<string, QueryParamValue>,
  });
}

export function getCustomer(id: string): Promise<AdminCustomerDetail> {
  return customFetch<AdminCustomerDetail>(`/api/v1/admin/customers/${id}`, {
    withAuth: true,
  });
}

export function getCustomerOrders(
  id: string,
  params: CustomerOrdersQueryParams = {},
): Promise<AdminCustomerOrdersPage> {
  return customFetch<AdminCustomerOrdersPage>(`/api/v1/admin/customers/${id}/orders`, {
    withAuth: true,
    params: params as Record<string, QueryParamValue>,
  });
}
