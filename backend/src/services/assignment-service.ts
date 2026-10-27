import type { OptimizedAssignment } from '../algorithms/optimize-assignment';
import { optimizeAssignment } from '../algorithms/optimize-assignment';
import type { OrderStatus } from '../models/domain';
import type { OrderRecord } from '../models/records';
import type { DeliveryPersonStore } from './delivery-person-store';
import type { OrderStore } from './order-store';

export class AssignmentService {
  constructor(
    private readonly orders: OrderStore,
    private readonly couriers: DeliveryPersonStore,
  ) {}

  async suggest(): Promise<OptimizedAssignment> {
    const [readyOrders, availableCouriers] = await Promise.all([this.orders.listReady(), this.couriers.listAvailable()]);
    return optimizeAssignment(readyOrders, availableCouriers);
  }

  accept(orderId: string, deliveryPersonId: string): Promise<OrderRecord> {
    return this.orders.transition(orderId, 'delivering' satisfies OrderStatus, deliveryPersonId);
  }
}
