export const roles = ['admin', 'viewer'] as const;
export const categories = ['meal', 'drink', 'dessert', 'side'] as const;
export const orderStatuses = ['pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'] as const;
export const vehicleTypes = ['bicycle', 'motorcycle', 'car'] as const;

export type Role = (typeof roles)[number];
export type Category = (typeof categories)[number];
export type OrderStatus = (typeof orderStatuses)[number];
export type VehicleType = (typeof vehicleTypes)[number];

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

export function toPage<T>(data: T[], total: number, page: number, pageSize: number): Page<T> {
  return {
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    },
  };
}
