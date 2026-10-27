import { useCallback, useEffect, useState } from 'react';
import { CourierForm } from '@/components/couriers/CourierForm';
import { CourierTable } from '@/components/couriers/CourierTable';
import { Button } from '@/components/ui/Button';
import { EmptyState, Notice, PageHeader } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { ApiError } from '@/services/http';
import { createCourier, deleteCourier, listCouriers, updateCourier } from '@/services/resources';
import type { DeliveryPerson, DeliveryPersonInput } from '@/types/api';

export function CouriersPage() {
  const [couriers, setCouriers] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<DeliveryPerson | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listCouriers();
      setCouriers(response.data);
      setError(null);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar os entregadores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(input: DeliveryPersonInput) {
    if (editing) await updateCourier(editing.id, input);
    else await createCourier(input);
    setEditing(null);
    setCreating(false);
    await load();
  }

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Entregadores"
        description="Quem está ativo e com localização entra na sugestão de rotas."
        action={<Button onClick={() => setCreating(true)}>Novo entregador</Button>}
      />
      {error ? <Notice>{error}</Notice> : null}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : couriers.length === 0 ? (
        <EmptyState>Nenhum entregador cadastrado.</EmptyState>
      ) : (
        <CourierTable
          couriers={couriers}
          onEdit={setEditing}
          onDelete={(courier) => {
            void deleteCourier(courier.id)
              .then(() => load())
              .catch((caught: unknown) => setError(caught instanceof ApiError ? caught.message : 'Não foi possível excluir'));
          }}
        />
      )}
      {creating || editing ? (
        <Modal title={editing ? 'Editar entregador' : 'Novo entregador'} onClose={() => { setCreating(false); setEditing(null); }}>
          <CourierForm initial={editing ?? undefined} onCancel={() => { setCreating(false); setEditing(null); }} onSubmit={save} />
        </Modal>
      ) : null}
    </section>
  );
}
