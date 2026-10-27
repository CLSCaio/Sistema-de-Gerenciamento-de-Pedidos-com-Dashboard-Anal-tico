import type { OrderStatus } from '../models/domain';
import { roundMoney } from '../utils/money';

export interface DeliveredSale {
  totalAmount: number;
  createdAt: Date;
  deliveredAt: Date;
  items: Array<{ soldProductId: string; productName: string; quantity: number }>;
}

export interface ReportSummary {
  revenue: { total: number };
  ordersByStatus: Array<{ status: OrderStatus; count: number }>;
  topProducts: Array<{ productId: string; name: string; quantity: number }>;
  averageDeliveryTimeMinutes: number | null;
}

const statuses: OrderStatus[] = ['pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];

export function buildReport(
  delivered: DeliveredSale[],
  created: Array<{ status: OrderStatus; createdAt: Date }>,
  start: Date,
  end: Date,
): ReportSummary {
  const deliveredInPeriod = delivered.filter(
    (order) => order.deliveredAt.getTime() >= start.getTime() && order.deliveredAt.getTime() <= end.getTime(),
  );
  const createdInPeriod = created.filter(
    (order) => order.createdAt.getTime() >= start.getTime() && order.createdAt.getTime() <= end.getTime(),
  );
  const counts = new Map<OrderStatus, number>(statuses.map((status) => [status, 0]));
  createdInPeriod.forEach((order) => {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  });

  const quantities = new Map<string, { name: string; quantity: number }>();
  deliveredInPeriod.forEach((order) => {
    order.items.forEach((item) => {
      const current = quantities.get(item.soldProductId) ?? { name: item.productName, quantity: 0 };
      current.quantity += item.quantity;
      current.name = item.productName;
      quantities.set(item.soldProductId, current);
    });
  });

  const topProducts = [...quantities.entries()]
    .map(([productId, value]) => ({ productId, name: value.name, quantity: value.quantity }))
    .sort((left, right) => right.quantity - left.quantity || left.name.localeCompare(right.name))
    .slice(0, 10);

  const revenue = roundMoney(deliveredInPeriod.reduce((sum, order) => sum + order.totalAmount, 0));
  const averageDeliveryTimeMinutes =
    deliveredInPeriod.length === 0
      ? null
      : roundMoney(
          deliveredInPeriod.reduce(
            (sum, order) => sum + (order.deliveredAt.getTime() - order.createdAt.getTime()) / 60000,
            0,
          ) / deliveredInPeriod.length,
        );

  return {
    revenue: { total: revenue },
    ordersByStatus: statuses.map((status) => ({ status, count: counts.get(status) ?? 0 })),
    topProducts,
    averageDeliveryTimeMinutes,
  };
}
