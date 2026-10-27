import { api } from '@/services/http';
import type {
  AssignmentSuggestion,
  DeliveryPerson,
  DeliveryPersonInput,
  Order,
  OrderStatus,
  Page,
  Product,
  ProductInput,
  PublicUser,
  Report,
} from '@/types/api';

function queryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

export function login(email: string, password: string): Promise<{ accessToken: string; user: PublicUser }> {
  return api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function logout(): Promise<void> {
  return api('/api/auth/logout', { method: 'POST' });
}

export function listProducts(params: {
  page: number;
  pageSize?: number;
  search?: string;
  category?: string;
  includeUnavailable?: boolean;
}): Promise<Page<Product>> {
  return api(
    `/api/products${queryString({
      page: params.page,
      pageSize: params.pageSize ?? 10,
      search: params.search,
      category: params.category,
      includeUnavailable: params.includeUnavailable ? 'true' : undefined,
    })}`,
  );
}

export function createProduct(input: ProductInput): Promise<Product> {
  return api('/api/products', { method: 'POST', body: JSON.stringify(input) });
}

export function updateProduct(id: string, input: ProductInput): Promise<Product> {
  return api(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function setProductAvailability(id: string, isAvailable: boolean): Promise<Product> {
  return api(`/api/products/${id}/availability`, { method: 'PATCH', body: JSON.stringify({ isAvailable }) });
}

export function deleteProduct(id: string): Promise<void> {
  return api(`/api/products/${id}`, { method: 'DELETE' });
}

export function listOrders(params: {
  page: number;
  pageSize?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Page<Order>> {
  return api(
    `/api/orders${queryString({
      page: params.page,
      pageSize: params.pageSize ?? 8,
      status: params.status,
      startDate: params.startDate,
      endDate: params.endDate,
      sort: 'desc',
    })}`,
  );
}

export function createOrder(input: {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  latitude: number;
  longitude: number;
  items: Array<{ productId: string; quantity: number }>;
}): Promise<Order> {
  return api('/api/orders', { method: 'POST', body: JSON.stringify(input) });
}

export function changeOrderStatus(id: string, status: OrderStatus, deliveryPersonId?: string): Promise<Order> {
  return api(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(deliveryPersonId ? { deliveryPersonId } : {}) }),
  });
}

export function optimizeAssignment(): Promise<AssignmentSuggestion> {
  return api('/api/orders/optimize-assignment', { method: 'POST' });
}

export function acceptAssignment(orderId: string, deliveryPersonId: string): Promise<Order> {
  return api('/api/orders/accept-assignment', { method: 'POST', body: JSON.stringify({ orderId, deliveryPersonId }) });
}

export function listCouriers(page = 1): Promise<Page<DeliveryPerson>> {
  return api(`/api/delivery-persons${queryString({ page, pageSize: 20 })}`);
}

export function createCourier(input: DeliveryPersonInput): Promise<DeliveryPerson> {
  return api('/api/delivery-persons', { method: 'POST', body: JSON.stringify(input) });
}

export function updateCourier(id: string, input: DeliveryPersonInput): Promise<DeliveryPerson> {
  return api(`/api/delivery-persons/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function deleteCourier(id: string): Promise<void> {
  return api(`/api/delivery-persons/${id}`, { method: 'DELETE' });
}

export function getReport(startDate: string, endDate: string): Promise<Report> {
  return api(`/api/reports${queryString({ startDate, endDate })}`);
}
