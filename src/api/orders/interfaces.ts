import type { Page } from '../config/page';

export interface AdminOrderListItem {
  id: string;
  createdAt: string;
  customerName: string | null;
  customerPhone: string | null;
  wineStoreId: number | null;
  wineStoreName: string | null;
  totalAmount: number;
  statusName: string;
}

export interface OrderedProductItem {
  productId: string;
  name: string;
  article: string;
  quantity: number;
  price: number;
  sum: number;
}

export interface AdminOrderDetail {
  id: string;
  date: string;
  statusName: string;
  pickupAddress: string;
  totalAmount: number;
  items: OrderedProductItem[];
  customerPhone: string | null;
  customerName: string | null;
  pickupDate: string | null;
  paymentMethod: string | null;
  customerId: string | null;
  customerEmail: string | null;
  wineStoreId: number | null;
  promoDiscount: number | null;
}

export interface OrderStatusOption {
  name: string;
  label: string;
}

export interface OrdersQueryParams {
  page?: number;
  size?: number;
  status?: string;
  wineStoreId?: number;
  dateFrom?: string;
  dateTo?: string;
  query?: string;
}

export interface UpdateOrderStatusBody {
  status: string;
}

export type AdminOrdersPage = Page<AdminOrderListItem>;
