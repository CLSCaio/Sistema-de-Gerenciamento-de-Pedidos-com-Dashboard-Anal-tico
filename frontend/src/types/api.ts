export type Role = 'admin' | 'viewer';
export type Category = 'meal' | 'drink' | 'dessert' | 'side';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
export type VehicleType = 'bicycle' | 'motorcycle' | 'car';

export interface Page<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface PublicUser {
  id: string;
  email: string;
  role: Role;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string | null;
  isAvailable: boolean;
  preparationTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string | null;
  isAvailable: boolean;
  preparationTime: number;
}

export interface OrderItem {
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  latitude: number;
  longitude: number;
  status: OrderStatus;
  totalAmount: number;
  deliveryPersonId: string | null;
  deliveryPersonName: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  vehicleType: VehicleType;
  isActive: boolean;
  currentLatitude: number | null;
  currentLongitude: number | null;
  createdAt: string;
}

export interface DeliveryPersonInput {
  name: string;
  phone: string;
  vehicleType: VehicleType;
  isActive: boolean;
  currentLatitude: number | null;
  currentLongitude: number | null;
}

export interface AssignmentSuggestion {
  assignments: Array<{ orderId: string; deliveryPersonId: string; estimatedDistanceKm: number }>;
  unassigned: Array<{ orderId: string; reason: string }>;
  totalDistanceKm: number;
}

export interface Report {
  revenue: { total: number };
  ordersByStatus: Array<{ status: OrderStatus; count: number }>;
  topProducts: Array<{ productId: string; name: string; quantity: number }>;
  averageDeliveryTimeMinutes: number | null;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details: Array<{ field: string; message: string }>;
  };
}
