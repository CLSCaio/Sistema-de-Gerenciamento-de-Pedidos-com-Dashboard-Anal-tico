import type { OrderStatus } from '../models/domain';
import { AppError } from '../utils/errors';
import { roundMoney } from '../utils/money';

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivering', 'cancelled'],
  delivering: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function assertStatusTransition(from: OrderStatus, to: OrderStatus, deliveryPersonId?: string): void {
  const allowed = transitions[from];
  if (!allowed.includes(to)) {
    throw new AppError(422, 'INVALID_STATUS_TRANSITION', `Transição de status inválida: ${from} → ${to}`);
  }
  if (to === 'delivering' && !deliveryPersonId) {
    throw new AppError(422, 'DELIVERY_PERSON_REQUIRED', 'É obrigatório atribuir um entregador para iniciar a entrega', [
      { field: 'deliveryPersonId', message: 'Entregador é obrigatório nesta transição' },
    ]);
  }
}

export function assertCourierCanTakeOrder(isActive: boolean, deliveriesInProgress: number): void {
  if (!isActive || deliveriesInProgress > 0) {
    throw new AppError(422, 'COURIER_UNAVAILABLE', 'Entregador indisponível para nova atribuição', [
      { field: 'deliveryPersonId', message: 'Entregador inativo ou já possui pedido em rota' },
    ]);
  }
}

export function assertProductsAvailable(products: Array<{ id: string; isAvailable: boolean }>, requestedIds: string[]): void {
  if (products.length !== requestedIds.length) {
    throw new AppError(404, 'NOT_FOUND', 'Um ou mais produtos não foram encontrados', [
      { field: 'items', message: 'Produto não encontrado' },
    ]);
  }
  const unavailable = products.filter((product) => !product.isAvailable);
  if (unavailable.length > 0) {
    throw new AppError(422, 'PRODUCT_UNAVAILABLE', 'Não é possível criar pedido com produto indisponível', [
      { field: 'items', message: 'Há produtos com disponibilidade desativada' },
    ]);
  }
}

export function calculateOrderTotal(items: Array<{ unitPrice: number; quantity: number }>): number {
  return roundMoney(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
}
