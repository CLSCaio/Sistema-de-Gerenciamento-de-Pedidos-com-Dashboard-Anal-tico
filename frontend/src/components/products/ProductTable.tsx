import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types/api';
import { categoryLabels, formatMoney } from '@/utils/labels';

interface ProductTableProps {
  products: Product[];
  canEdit: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggle: (product: Product) => void;
}

export function ProductTable({ products, canEdit, onEdit, onDelete, onToggle }: ProductTableProps) {
  return (
    <div className="overflow-auto rounded-3xl border border-sand bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-sand/60 text-mist">
          <tr>
            <th className="px-4 py-3">Produto</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Preço</th>
            <th className="px-4 py-3">Preparo</th>
            <th className="px-4 py-3">Status</th>
            {canEdit ? <th className="px-4 py-3">Ações</th> : null}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-sand">
              <td className="px-4 py-3">
                <p className="font-semibold">{product.name}</p>
                <p className="max-w-xs text-mist">{product.description}</p>
              </td>
              <td className="px-4 py-3">{categoryLabels[product.category]}</td>
              <td className="px-4 py-3">{formatMoney(product.price)}</td>
              <td className="px-4 py-3">{product.preparationTime} min</td>
              <td className="px-4 py-3">
                <Badge tone={product.isAvailable ? 'bg-emerald-100 text-emerald-950' : 'bg-stone-200 text-stone-700'}>
                  {product.isAvailable ? 'Disponível' : 'Indisponível'}
                </Badge>
              </td>
              {canEdit ? (
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => onToggle(product)}>
                      {product.isAvailable ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button variant="ghost" onClick={() => onEdit(product)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => onDelete(product)}>
                      Excluir
                    </Button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
