import type { OrderStatus } from '../models/domain';
import type { DeliveredSale } from './report-summary';
import { toMoneyNumber } from '../utils/money';
import { prisma } from '../utils/prisma';

export interface ReportStore {
  deliveredSales(start: Date, end: Date): Promise<DeliveredSale[]>;
  createdOrders(start: Date, end: Date): Promise<Array<{ status: OrderStatus; createdAt: Date }>>;
}

export class PrismaReportStore implements ReportStore {
  async deliveredSales(start: Date, end: Date): Promise<DeliveredSale[]> {
    const rows = await prisma.order.findMany({
      where: { statusEvents: { some: { status: 'delivered', createdAt: { gte: start, lte: end } } } },
      select: {
        totalAmount: true,
        createdAt: true,
        statusEvents: {
          where: { status: 'delivered' },
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: { createdAt: true },
        },
        items: { select: { soldProductId: true, productName: true, quantity: true } },
      },
    });
    return rows.flatMap((row) => {
      const deliveredAt = row.statusEvents[0]?.createdAt;
      if (!deliveredAt) return [];
      return [
        {
          totalAmount: toMoneyNumber(row.totalAmount),
          createdAt: row.createdAt,
          deliveredAt,
          items: row.items.map((item) => ({
            soldProductId: item.soldProductId,
            productName: item.productName,
            quantity: item.quantity,
          })),
        },
      ];
    });
  }

  createdOrders(start: Date, end: Date): Promise<Array<{ status: OrderStatus; createdAt: Date }>> {
    return prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { status: true, createdAt: true },
    });
  }
}
