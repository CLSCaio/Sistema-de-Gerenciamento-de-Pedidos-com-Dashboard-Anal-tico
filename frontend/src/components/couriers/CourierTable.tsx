import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { DeliveryPerson } from '@/types/api';
import { vehicleLabels } from '@/utils/labels';

export function CourierTable({
  couriers,
  onEdit,
  onDelete,
}: {
  couriers: DeliveryPerson[];
  onEdit: (courier: DeliveryPerson) => void;
  onDelete: (courier: DeliveryPerson) => void;
}) {
  return (
    <div className="overflow-auto rounded-3xl border border-sand bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-sand/60 text-mist">
          <tr>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">Telefone</th>
            <th className="px-4 py-3">Veículo</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {couriers.map((courier) => (
            <tr key={courier.id} className="border-t border-sand">
              <td className="px-4 py-3 font-semibold">{courier.name}</td>
              <td className="px-4 py-3">{courier.phone}</td>
              <td className="px-4 py-3">{vehicleLabels[courier.vehicleType]}</td>
              <td className="px-4 py-3">
                <Badge tone={courier.isActive ? 'bg-emerald-100 text-emerald-950' : 'bg-stone-200 text-stone-700'}>
                  {courier.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => onEdit(courier)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(courier)}>
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
