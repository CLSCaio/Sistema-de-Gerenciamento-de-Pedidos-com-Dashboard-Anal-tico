import { toPage, type Page } from '../models/domain';
import type { ProductListQuery } from '../models/schemas';
import type { ProductRecord } from '../models/records';
import { AppError } from '../utils/errors';
import type { ProductStore, ProductWriteData } from './product-store';

export class ProductService {
  constructor(private readonly store: ProductStore) {}

  list(query: ProductListQuery): Promise<Page<ProductRecord>> {
    const isAvailable = resolveAvailability(query);
    return this.store
      .list({
        page: query.page,
        pageSize: query.pageSize,
        ...(query.search ? { search: query.search } : {}),
        ...(query.category ? { category: query.category } : {}),
        ...(isAvailable === undefined ? {} : { isAvailable }),
      })
      .then((result) => toPage(result.items, result.total, query.page, query.pageSize));
  }

  async get(id: string): Promise<ProductRecord> {
    const product = await this.store.findById(id);
    if (!product) throw new AppError(404, 'NOT_FOUND', 'Produto não encontrado');
    return product;
  }

  create(input: ProductWriteData): Promise<ProductRecord> {
    return this.store.create(input);
  }

  async update(id: string, input: ProductWriteData): Promise<ProductRecord> {
    const product = await this.store.update(id, input);
    if (!product) throw new AppError(404, 'NOT_FOUND', 'Produto não encontrado');
    return product;
  }

  async setAvailability(id: string, isAvailable: boolean): Promise<ProductRecord> {
    const product = await this.store.setAvailability(id, isAvailable);
    if (!product) throw new AppError(404, 'NOT_FOUND', 'Produto não encontrado');
    return product;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.store.findById(id);
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Produto não encontrado');
    const blocking = await this.store.countBlockingOrders(id);
    if (blocking > 0) {
      throw new AppError(
        422,
        'PRODUCT_IN_USE',
        'Não é possível excluir um produto vinculado a pedidos pendentes ou em preparo',
      );
    }
    await this.store.delete(id);
  }
}

function resolveAvailability(query: ProductListQuery): boolean | undefined {
  if (query.isAvailable === 'true') return true;
  if (query.isAvailable === 'false') return false;
  if (query.includeUnavailable === 'true') return undefined;
  return true;
}

export function toProductWrite(input: {
  name: string;
  description: string;
  price: number;
  category: ProductWriteData['category'];
  imageUrl: string | null;
  isAvailable?: boolean;
  preparationTime: number;
}): ProductWriteData {
  return {
    name: input.name,
    description: input.description,
    price: input.price,
    category: input.category,
    imageUrl: input.imageUrl,
    isAvailable: input.isAvailable ?? true,
    preparationTime: input.preparationTime,
  };
}
