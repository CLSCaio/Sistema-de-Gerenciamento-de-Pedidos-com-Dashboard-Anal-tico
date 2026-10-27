import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Product } from '@/types/api';

export function DeleteProductDialog({ product, onConfirm, onClose }: { product: Product; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal title="Excluir produto" onClose={onClose}>
      <p>
        Confirma a exclusão de <strong>{product.name}</strong>? Produtos ligados a pedidos em preparo não podem ser removidos.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Voltar
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Excluir
        </Button>
      </div>
    </Modal>
  );
}
