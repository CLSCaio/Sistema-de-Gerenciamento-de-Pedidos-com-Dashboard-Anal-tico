import { Button } from '@/components/ui/Button';
import type { AssignmentSuggestion, DeliveryPerson, Order } from '@/types/api';

interface SuggestionListProps {
  suggestion: AssignmentSuggestion;
  orders: Order[];
  couriers: DeliveryPerson[];
  onAccept: (orderId: string, deliveryPersonId: string) => void;
  onReject: (orderId: string) => void;
}

export function SuggestionList({ suggestion, orders, couriers, onAccept, onReject }: SuggestionListProps) {
  const orderName = new Map(orders.map((order) => [order.id, order.customerName]));
  const courierName = new Map(couriers.map((courier) => [courier.id, courier.name]));

  return (
    <div className="grid gap-3">
      <p className="text-sm text-mist">Distância total estimada: {suggestion.totalDistanceKm.toFixed(2)} km</p>
      {suggestion.assignments.map((assignment) => (
        <article key={assignment.orderId} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4">
          <div>
            <p className="font-semibold">{orderName.get(assignment.orderId) ?? assignment.orderId}</p>
            <p className="text-sm text-mist">
              {courierName.get(assignment.deliveryPersonId) ?? assignment.deliveryPersonId} · {assignment.estimatedDistanceKm.toFixed(2)} km
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onAccept(assignment.orderId, assignment.deliveryPersonId)}>Aceitar</Button>
            <Button variant="secondary" onClick={() => onReject(assignment.orderId)}>
              Rejeitar
            </Button>
          </div>
        </article>
      ))}
      {suggestion.unassigned.map((item) => (
        <p key={item.orderId} className="rounded-2xl bg-orange-100 px-4 py-3 text-sm text-clay">
          {orderName.get(item.orderId) ?? item.orderId}: {item.reason}
        </p>
      ))}
    </div>
  );
}
