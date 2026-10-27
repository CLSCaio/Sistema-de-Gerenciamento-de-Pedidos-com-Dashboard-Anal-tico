import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Order } from '@/types/api';
import { formatDateTime, formatMoney, statusLabels, statusTone } from '@/utils/labels';

export function OrderTable({ orders, onOpen }: { orders: Order[]; onOpen: (order: Order) => void }) {
  return (
    <div className="grid gap-3">
      {orders.map((order) => (
        <article key={order.id} className="grid gap-3 rounded-3xl border border-sand bg-white p-4 md:grid-cols-[1.4fr_1fr_auto] md:items-center">
          <div>
            <p className="font-semibold">{order.customerName}</p>
            <p className="text-sm text-mist">{summarize(order)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={statusTone[order.status]}>{statusLabels[order.status]}</Badge>
            <span className="font-semibold">{formatMoney(order.totalAmount)}</span>
            <span className="text-sm text-mist">{formatDateTime(order.createdAt)}</span>
          </div>
          <Button variant="secondary" onClick={() => onOpen(order)}>
            Detalhes
          </Button>
        </article>
      ))}
    </div>
  );
}

function summarize(order: Order): string {
  const names = order.items.slice(0, 2).map((item) => `${item.quantity}x ${item.productName}`);
  const extra = order.items.length > 2 ? ` +${order.items.length - 2}` : '';
  return `${names.join(', ')}${extra}`;
}
