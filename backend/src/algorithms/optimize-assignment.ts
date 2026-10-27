import { haversineKm, roundKm } from './haversine';
import { minimizeAssignmentCost } from './hungarian';

export interface AssignmentOrder {
  id: string;
  latitude: number;
  longitude: number;
}

export interface AssignmentCourier {
  id: string;
  latitude: number;
  longitude: number;
}

export interface OptimizedAssignment {
  assignments: Array<{
    orderId: string;
    deliveryPersonId: string;
    estimatedDistanceKm: number;
  }>;
  unassigned: Array<{ orderId: string; reason: string }>;
  totalDistanceKm: number;
}

const UNASSIGNED_REASON = 'No available delivery person';

export function optimizeAssignment(orders: AssignmentOrder[], couriers: AssignmentCourier[]): OptimizedAssignment {
  if (orders.length === 0) {
    return { assignments: [], unassigned: [], totalDistanceKm: 0 };
  }

  if (couriers.length === 0) {
    return {
      assignments: [],
      unassigned: orders.map((order) => ({ orderId: order.id, reason: UNASSIGNED_REASON })),
      totalDistanceKm: 0,
    };
  }

  const cost = orders.map((order) =>
    couriers.map((courier) =>
      haversineKm(order.latitude, order.longitude, courier.latitude, courier.longitude),
    ),
  );
  const columnsByRow = minimizeAssignmentCost(cost);
  const assignments: OptimizedAssignment['assignments'] = [];
  const unassigned: OptimizedAssignment['unassigned'] = [];
  let totalDistance = 0;

  orders.forEach((order, row) => {
    const column = columnsByRow[row];
    const courier = column === undefined || column < 0 ? undefined : couriers[column];
    const distance = column === undefined || column < 0 ? undefined : cost[row]?.[column];
    if (!courier || distance === undefined) {
      unassigned.push({ orderId: order.id, reason: UNASSIGNED_REASON });
      return;
    }
    totalDistance += distance;
    assignments.push({
      orderId: order.id,
      deliveryPersonId: courier.id,
      estimatedDistanceKm: roundKm(distance),
    });
  });

  return {
    assignments,
    unassigned,
    totalDistanceKm: roundKm(totalDistance),
  };
}
