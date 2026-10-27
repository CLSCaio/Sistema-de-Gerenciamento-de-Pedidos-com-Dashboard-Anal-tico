import { describe, expect, it } from 'vitest';
import { buildReport, type DeliveredSale } from '../src/services/report-summary';

const start = new Date('2026-10-01T00:00:00.000-03:00');
const end = new Date('2026-10-31T23:59:59.999-03:00');

function sale(partial: Partial<DeliveredSale> & Pick<DeliveredSale, 'totalAmount' | 'deliveredAt'>): DeliveredSale {
  return {
    createdAt: partial.createdAt ?? new Date('2026-10-10T12:00:00.000-03:00'),
    items: partial.items ?? [],
    totalAmount: partial.totalAmount,
    deliveredAt: partial.deliveredAt,
  };
}

describe('relatórios', () => {
  it('soma a receita apenas dos pedidos entregues no período', () => {
    const report = buildReport(
      [
        sale({ totalAmount: 40, deliveredAt: new Date('2026-10-10T13:00:00.000-03:00') }),
        sale({
          totalAmount: 15.5,
          createdAt: new Date('2026-10-20T12:00:00.000-03:00'),
          deliveredAt: new Date('2026-10-20T13:00:00.000-03:00'),
        }),
        sale({ totalAmount: 99, deliveredAt: new Date('2026-09-02T13:00:00.000-03:00') }),
      ],
      [
        { status: 'delivered', createdAt: new Date('2026-10-10T12:00:00.000-03:00') },
        { status: 'pending', createdAt: new Date('2026-10-12T12:00:00.000-03:00') },
        { status: 'cancelled', createdAt: new Date('2026-09-01T12:00:00.000-03:00') },
      ],
      start,
      end,
    );

    expect(report.revenue.total).toBe(55.5);
    expect(report.ordersByStatus.find((entry) => entry.status === 'pending')?.count).toBe(1);
    expect(report.ordersByStatus.find((entry) => entry.status === 'cancelled')?.count).toBe(0);
    expect(report.averageDeliveryTimeMinutes).toBe(60);
  });

  it('ranqueia os 10 produtos mais vendidos por quantidade', () => {
    const items = Array.from({ length: 12 }, (_, index) => ({
      soldProductId: `00000000-0000-4000-8000-0000000000${index.toString().padStart(2, '0')}`,
      productName: `Produto ${String(index).padStart(2, '0')}`,
      quantity: index + 1,
    }));
    const report = buildReport(
      [sale({ totalAmount: 100, deliveredAt: new Date('2026-10-15T15:00:00.000-03:00'), items })],
      [],
      start,
      end,
    );

    expect(report.topProducts).toHaveLength(10);
    expect(report.topProducts[0]).toMatchObject({ name: 'Produto 11', quantity: 12 });
    expect(report.topProducts.some((product) => product.name === 'Produto 00')).toBe(false);
    expect(report.topProducts.some((product) => product.name === 'Produto 01')).toBe(false);
  });
});
