import { useCallback, useEffect, useState } from 'react';
import { SuggestionList } from '@/components/assignment/SuggestionList';
import { Button } from '@/components/ui/Button';
import { EmptyState, Notice, PageHeader } from '@/components/ui/Feedback';
import { Spinner } from '@/components/ui/Spinner';
import { ApiError } from '@/services/http';
import { acceptAssignment, listCouriers, listOrders, optimizeAssignment } from '@/services/resources';
import type { AssignmentSuggestion, DeliveryPerson, Order } from '@/types/api';

export function AssignmentPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<DeliveryPerson[]>([]);
  const [suggestion, setSuggestion] = useState<AssignmentSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ready, people] = await Promise.all([
        listOrders({ page: 1, pageSize: 50, status: 'ready' }),
        listCouriers(),
      ]);
      setOrders(ready.data);
      setCouriers(people.data.filter((courier) => courier.isActive));
      setError(null);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar a fila');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function suggest() {
    try {
      setSuggestion(await optimizeAssignment());
      setError(null);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível calcular a atribuição');
    }
  }

  async function accept(orderId: string, deliveryPersonId: string) {
    try {
      await acceptAssignment(orderId, deliveryPersonId);
      setSuggestion((current) =>
        current
          ? { ...current, assignments: current.assignments.filter((item) => item.orderId !== orderId) }
          : current,
      );
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível aceitar a atribuição');
    }
  }

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Atribuição"
        description="O algoritmo minimiza a soma das distâncias entre pedidos prontos e entregadores livres."
        action={<Button onClick={() => void suggest()}>Sugerir atribuição otimizada</Button>}
      />
      {error ? <Notice>{error}</Notice> : null}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-3">
            <h2 className="font-display text-2xl">Prontos para sair</h2>
            {orders.length === 0 ? <EmptyState>Nenhum pedido pronto.</EmptyState> : orders.map((order) => (
              <article key={order.id} className="rounded-3xl bg-white p-4">
                <p className="font-semibold">{order.customerName}</p>
                <p className="text-sm text-mist">{order.deliveryAddress}</p>
              </article>
            ))}
          </div>
          <div className="grid content-start gap-3">
            <h2 className="font-display text-2xl">Entregadores ativos</h2>
            {couriers.length === 0 ? <EmptyState>Nenhum entregador ativo.</EmptyState> : couriers.map((courier) => (
              <article key={courier.id} className="rounded-3xl bg-white p-4">
                <p className="font-semibold">{courier.name}</p>
                <p className="text-sm text-mist">
                  {courier.currentLatitude === null ? 'Sem localização' : `${courier.currentLatitude}, ${courier.currentLongitude}`}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
      {suggestion ? (
        <SuggestionList
          suggestion={suggestion}
          orders={orders}
          couriers={couriers}
          onAccept={(orderId, deliveryPersonId) => void accept(orderId, deliveryPersonId)}
          onReject={(orderId) =>
            setSuggestion((current) =>
              current ? { ...current, assignments: current.assignments.filter((item) => item.orderId !== orderId) } : current,
            )
          }
        />
      ) : null}
    </section>
  );
}
