import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { DeliveryPerson, OrderStatus } from '@/types/api';
const actions: Record<OrderStatus, Array<{ status: OrderStatus; label: string }>> = {
  pending: [
    { status: 'preparing', label: 'Iniciar preparo' },
    { status: 'cancelled', label: 'Cancelar' },
  ],
  preparing: [
    { status: 'ready', label: 'Marcar pronto' },
    { status: 'cancelled', label: 'Cancelar' },
  ],
  ready: [
    { status: 'delivering', label: 'Enviar para entrega' },
    { status: 'cancelled', label: 'Cancelar' },
  ],
  delivering: [{ status: 'delivered', label: 'Confirmar entrega' }],
  delivered: [],
  cancelled: [],
};

interface OrderStatusActionsProps {
  status: OrderStatus;
  couriers: DeliveryPerson[];
  onChange: (status: OrderStatus, deliveryPersonId?: string) => void;
}

export function OrderStatusActions({ status, couriers, onChange }: OrderStatusActionsProps) {
  const [courierId, setCourierId] = useState(couriers[0]?.id ?? '');
  const options = actions[status];
  if (options.length === 0) return <p className="text-sm text-mist">Sem transições disponíveis</p>;

  return (
    <div className="flex flex-col gap-2">
      {status === 'ready' ? (
        <Select aria-label="Entregador" value={courierId} onChange={(event) => setCourierId(event.target.value)}>
          <option value="">Selecione o entregador</option>
          {couriers.filter((courier) => courier.isActive).map((courier) => (
            <option key={courier.id} value={courier.id}>
              {courier.name}
            </option>
          ))}
        </Select>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.status}
            variant={option.status === 'cancelled' ? 'danger' : 'primary'}
            onClick={() => onChange(option.status, option.status === 'delivering' ? courierId : undefined)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
