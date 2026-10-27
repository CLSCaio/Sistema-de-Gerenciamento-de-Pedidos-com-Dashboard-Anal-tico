import { toPage, type Page } from '../models/domain';
import type { DeliveryPersonListQuery, DeliveryPersonInput } from '../models/schemas';
import type { DeliveryPersonRecord } from '../models/records';
import { AppError } from '../utils/errors';
import type { DeliveryPersonStore, DeliveryPersonWriteData } from './delivery-person-store';

export class DeliveryPersonService {
  constructor(private readonly store: DeliveryPersonStore) {}

  list(query: DeliveryPersonListQuery): Promise<Page<DeliveryPersonRecord>> {
    const isActive = query.isActive === undefined ? undefined : query.isActive === 'true';
    return this.store
      .list({
        page: query.page,
        pageSize: query.pageSize,
        ...(isActive === undefined ? {} : { isActive }),
      })
      .then((result) => toPage(result.items, result.total, query.page, query.pageSize));
  }

  async get(id: string): Promise<DeliveryPersonRecord> {
    const person = await this.store.findById(id);
    if (!person) throw new AppError(404, 'NOT_FOUND', 'Entregador não encontrado');
    return person;
  }

  create(input: DeliveryPersonInput): Promise<DeliveryPersonRecord> {
    return this.store.create(normalize(input));
  }

  async update(id: string, input: DeliveryPersonInput): Promise<DeliveryPersonRecord> {
    const person = await this.store.update(id, normalize(input));
    if (!person) throw new AppError(404, 'NOT_FOUND', 'Entregador não encontrado');
    return person;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.store.findById(id);
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Entregador não encontrado');
    const orders = await this.store.countOrders(id);
    if (orders > 0) {
      throw new AppError(422, 'COURIER_IN_USE', 'Não é possível excluir um entregador vinculado a pedidos');
    }
    await this.store.delete(id);
  }
}

function normalize(input: DeliveryPersonInput): DeliveryPersonWriteData {
  const currentLatitude = input.currentLatitude ?? null;
  const currentLongitude = input.currentLongitude ?? null;
  if ((currentLatitude === null) !== (currentLongitude === null)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Latitude e longitude devem ser informadas juntas', [
      { field: 'currentLatitude', message: 'Informe as duas coordenadas ou nenhuma' },
    ]);
  }
  return {
    name: input.name,
    phone: input.phone,
    vehicleType: input.vehicleType,
    isActive: input.isActive ?? true,
    currentLatitude,
    currentLongitude,
  };
}
