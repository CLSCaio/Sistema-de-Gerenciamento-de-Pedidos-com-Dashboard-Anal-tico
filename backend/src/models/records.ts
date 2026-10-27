import type { Category } from './domain';

export interface ProductRecord {
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

export interface OrderItemRecord {
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  latitude: number;
  longitude: number;
  status: import('./domain').OrderStatus;
  totalAmount: number;
  deliveryPersonId: string | null;
  deliveryPersonName: string | null;
  items: OrderItemRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPersonRecord {
  id: string;
  name: string;
  phone: string;
  vehicleType: import('./domain').VehicleType;
  isActive: boolean;
  currentLatitude: number | null;
  currentLongitude: number | null;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  role: import('./domain').Role;
}
