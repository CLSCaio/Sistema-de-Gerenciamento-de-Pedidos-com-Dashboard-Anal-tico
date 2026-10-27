import { toPage, type Page } from '../models/domain';
import type { OrderStatus } from '../models/domain';
import type { OrderRecord } from '../models/records';
import type { CreateOrderInput, OrderListQuery } from '../models/schemas';
import { AppError } from '../utils/errors';
import { parsePeriod } from '../utils/dates';
import type { OrderStore } from './order-store';

export class OrderService {
  constructor(private readonly store: OrderStore) {}

  list(query: OrderListQuery): Promise<Page<OrderRecord>> {
    const period = query.startDate && query.endDate ? parsePeriod(query.startDate, query.endDate) : undefined;
    if ((query.startDate && !query.endDate) || (!query.startDate && query.endDate)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Informe data inicial e data final juntas', [
        { field: 'startDate', message: 'Período incompleto' },
      ]);
    }
    return this.store
      .list({
        page: query.page,
        pageSize: query.pageSize,
        sort: query.sort,
        ...(query.status ? { status: query.status } : {}),
        ...(period ? { start: period.start, end: period.end } : {}),
      })
      .then((result) => toPage(result.items, result.total, query.page, query.pageSize));
  }

  async get(id: string): Promise<OrderRecord> {
    const order = await this.store.findById(id);
    if (!order) throw new AppError(404, 'NOT_FOUND', 'Pedido não encontrado');
    return order;
  }

  create(input: CreateOrderInput): Promise<OrderRecord> {
    return this.store.create(input);
  }

  transition(id: string, status: OrderStatus, deliveryPersonId?: string): Promise<OrderRecord> {
    return this.store.transition(id, status, deliveryPersonId);
  }
}
