import { customFetch } from '../config/customFetch';
import type { QueryParamValue } from '../config/interfaces';
import type {
  AdminCustomerDetail,
  AdminCustomerOrdersPage,
  AdminCustomersPage,
  CustomerOrdersQueryParams,
  CustomersQueryParams,
  UpdateCustomerDiscountRequest,
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

/** Назначить или снять личную скидку клиента (percent = 0 снимает). */
export function updateCustomerDiscount(
  id: string,
  body: UpdateCustomerDiscountRequest,
): Promise<AdminCustomerDetail> {
  return customFetch<AdminCustomerDetail>(`/api/v1/admin/customers/${id}/discount`, {
    method: 'PATCH',
    withAuth: true,
    body,
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
