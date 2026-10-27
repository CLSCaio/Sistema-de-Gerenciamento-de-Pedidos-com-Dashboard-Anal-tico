import { useCallback, useEffect, useState } from 'react';
import { CreateOrderForm } from '@/components/orders/CreateOrderForm';
import { OrderDetailsModal } from '@/components/orders/OrderDetailsModal';
import { OrderFilters, type OrderFilterValue } from '@/components/orders/OrderFilters';
import { OrderTable } from '@/components/orders/OrderTable';
import { Button } from '@/components/ui/Button';
import { EmptyState, Notice, PageHeader } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useInterval } from '@/hooks/useInterval';
import { ApiError } from '@/services/http';
import { changeOrderStatus, createOrder, listCouriers, listOrders } from '@/services/resources';
import type { DeliveryPerson, Order, OrderStatus } from '@/types/api';
import { dateRangeError } from '@/utils/masks';

const emptyMeta = { page: 1, pageSize: 8, total: 0, totalPages: 0 };

export function OrdersPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin';
  const [filters, setFilters] = useState<OrderFilterValue>({ status: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState(emptyMeta);
  const [couriers, setCouriers] = useState<DeliveryPerson[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      const periodIncomplete = Boolean(filters.startDate) !== Boolean(filters.endDate);
      if (periodIncomplete || dateRangeError(filters.startDate, filters.endDate)) {
        setError(null);
        if (!silent) setLoading(false);
        return;
      }
      if (!silent) setLoading(true);
      try {
        const response = await listOrders({
          page,
          status: filters.status || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        });
        setOrders(response.data);
        setMeta(response.meta);
        setSelected((current) => response.data.find((order) => order.id === current?.id) ?? current);
        setError(null);
      } catch (caught) {
        setError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar os pedidos');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [filters.endDate, filters.startDate, filters.status, page],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useInterval(() => {
    void load(true);
  }, 8000);

  useEffect(() => {
    if (!canEdit) return;
    void listCouriers().then((response) => setCouriers(response.data)).catch(() => setCouriers([]));
  }, [canEdit]);

  async function updateStatus(status: OrderStatus, deliveryPersonId?: string) {
    if (!selected) return;
    if (status === 'delivering' && !deliveryPersonId) {
      setError('Selecione um entregador para iniciar a entrega');
      return;
    }
    try {
      await changeOrderStatus(selected.id, status, deliveryPersonId);
      await load(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível atualizar o status');
    }
  }

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Pedidos"
        description="A fila atualiza sozinha. Cada status só avança pelas transições permitidas."
        action={canEdit ? <Button onClick={() => setCreating(true)}>Novo pedido</Button> : undefined}
      />
      <OrderFilters
        value={filters}
        onChange={(value) => {
          setPage(1);
          setFilters(value);
        }}
      />
      {error ? <Notice>{error}</Notice> : null}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState>Nenhum pedido neste filtro.</EmptyState>
      ) : (
        <OrderTable orders={orders} onOpen={setSelected} />
      )}
      <Pagination page={meta.page} totalPages={meta.totalPages} onPage={setPage} />
      {selected ? (
        <OrderDetailsModal order={selected} couriers={couriers} canEdit={canEdit} onClose={() => setSelected(null)} onStatus={(status, deliveryPersonId) => void updateStatus(status, deliveryPersonId)} />
      ) : null}
      {creating ? (
        <Modal title="Novo pedido" onClose={() => setCreating(false)}>
          <CreateOrderForm
            onCancel={() => setCreating(false)}
            onSubmit={async (input) => {
              await createOrder(input);
              setCreating(false);
              await load(true);
            }}
          />
        </Modal>
      ) : null}
    </section>
  );
}
