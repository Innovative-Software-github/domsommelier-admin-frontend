import type { Page } from '../config/page';
import type { UserRole } from '../../auth/roles';

export interface AdminCustomerListItem {
  id: string;
  displayName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  defaultWineStoreName: string | null;
  /** Личная скидка в процентах, 0 — скидки нет. */
  discountPercent: number | null;
}

export interface AdminCustomerDetail {
  id: string;
  firstName: string | null;
  secondName: string | null;
  middleName: string | null;
  displayName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  defaultWineStoreId: number | null;
  defaultWineStoreName: string | null;
  /** Личная скидка в процентах, 0 — скидки нет. */
  discountPercent: number | null;
  /** Основание для скидки — видно только в админке. */
  discountComment: string | null;
  discountUpdatedAt: string | null;
}

export interface UpdateCustomerDiscountRequest {
  /** 0 — снять скидку. */
  percent: number;
  comment?: string;
}

export interface AdminCustomerOrder {
  id: string;
  createdAt: string;
  statusName: string;
  totalAmount: number;
  wineStoreName: string | null;
}

export interface CustomersQueryParams {
  page?: number;
  size?: number;
  query?: string;
  role?: UserRole;
}

export interface CustomerOrdersQueryParams {
  page?: number;
  size?: number;
}

export type AdminCustomersPage = Page<AdminCustomerListItem>;
export type AdminCustomerOrdersPage = Page<AdminCustomerOrder>;
