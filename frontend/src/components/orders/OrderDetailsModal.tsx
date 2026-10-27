import { OrderStatusActions } from '@/components/orders/OrderStatusActions';
import { Modal } from '@/components/ui/Modal';
import type { DeliveryPerson, Order, OrderStatus } from '@/types/api';
import { formatDateTime, formatMoney, statusLabels } from '@/utils/labels';

interface OrderDetailsModalProps {
  order: Order;
  couriers: DeliveryPerson[];
  canEdit: boolean;
  onClose: () => void;
  onStatus: (status: OrderStatus, deliveryPersonId?: string) => void;
}

export function OrderDetailsModal({ order, couriers, canEdit, onClose, onStatus }: OrderDetailsModalProps) {
  return (
    <Modal title={order.customerName} onClose={onClose}>
      <div className="grid gap-4 text-sm">
        <p>{order.deliveryAddress}</p>
        <p>
          {order.customerPhone} · {formatDateTime(order.createdAt)} · {statusLabels[order.status]}
        </p>
        <ul className="divide-y divide-sand rounded-2xl bg-white">
          {order.items.map((item) => (
            <li key={`${item.productName}-${item.unitPrice}-${item.quantity}`} className="flex justify-between px-4 py-3">
              <span>
                {item.quantity}x {item.productName}
              </span>
              <span>{formatMoney(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="text-right text-lg font-bold">{formatMoney(order.totalAmount)}</p>
        {order.deliveryPersonName ? <p>Entregador: {order.deliveryPersonName}</p> : null}
        {canEdit ? <OrderStatusActions status={order.status} couriers={couriers} onChange={onStatus} /> : null}
      </div>
    </Modal>
  );
}
