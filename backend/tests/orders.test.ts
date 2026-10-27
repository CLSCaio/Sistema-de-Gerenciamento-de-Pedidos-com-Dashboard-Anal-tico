import { describe, expect, it } from 'vitest';
import type { OrderStatus } from '../src/models/domain';
import type { OrderRecord } from '../src/models/records';
import type { CreateOrderInput } from '../src/models/schemas';
import { OrderService } from '../src/services/order-service';
import { assertStatusTransition } from '../src/services/order-rules';
import type { OrderListFilters, OrderStore, ReadyOrderPoint } from '../src/services/order-store';
import { AppError } from '../src/utils/errors';

class MemoryOrderStore implements OrderStore {
  order: OrderRecord;

  constructor(status: OrderStatus) {
    this.order = {
      id: '20000000-0000-4000-8000-000000000001',
      customerName: 'Ana Lima',
      customerPhone: '(11) 98888-1001',
      deliveryAddress: 'Rua dos Pinheiros, 100, São Paulo',
      latitude: -23.56,
      longitude: -46.68,
      status,
      totalAmount: 28.9,
      deliveryPersonId: null,
      deliveryPersonName: null,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async list(_filters: OrderListFilters): Promise<{ items: OrderRecord[]; total: number }> {
    return { items: [this.order], total: 1 };
  }

  async findById(id: string): Promise<OrderRecord | null> {
    return this.order.id === id ? this.order : null;
  }

  async create(_input: CreateOrderInput): Promise<OrderRecord> {
    return this.order;
  }

  async transition(id: string, status: OrderStatus, deliveryPersonId?: string): Promise<OrderRecord> {
    if (this.order.id !== id) throw new AppError(404, 'NOT_FOUND', 'Pedido não encontrado');
    assertStatusTransition(this.order.status, status, deliveryPersonId);
    this.order = {
      ...this.order,
      status,
      deliveryPersonId: deliveryPersonId ?? this.order.deliveryPersonId,
      updatedAt: new Date().toISOString(),
    };
    return this.order;
  }

  async listReady(): Promise<ReadyOrderPoint[]> {
    return [];
  }
}

describe('transição de status do pedido', () => {
  it('aceita a transição pending → preparing', async () => {
    const service = new OrderService(new MemoryOrderStore('pending'));
    const order = await service.transition('20000000-0000-4000-8000-000000000001', 'preparing');
    expect(order.status).toBe('preparing');
  });

  it('rejeita transição fora do diagrama com 422', async () => {
    const service = new OrderService(new MemoryOrderStore('delivered'));
    await expect(service.transition('20000000-0000-4000-8000-000000000001', 'pending')).rejects.toMatchObject({
      statusCode: 422,
      code: 'INVALID_STATUS_TRANSITION',
    });
  });

  it('exige entregador para sair de ready e ir para delivering', () => {
    expect(() => assertStatusTransition('ready', 'delivering')).toThrow(AppError);
  });
});
