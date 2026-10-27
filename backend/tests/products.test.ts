import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createProductController } from '../src/controllers/product-controller';
import type { Category } from '../src/models/domain';
import type { ProductRecord } from '../src/models/records';
import { ProductService } from '../src/services/product-service';
import type { ProductListFilters, ProductStore, ProductWriteData } from '../src/services/product-store';
import { errorHandler } from '../src/middlewares/error-handler';

class MemoryProductStore implements ProductStore {
  products: ProductRecord[] = [];

  async list(filters: ProductListFilters): Promise<{ items: ProductRecord[]; total: number }> {
    return { items: this.products.slice(0, filters.pageSize), total: this.products.length };
  }

  async findById(id: string): Promise<ProductRecord | null> {
    return this.products.find((product) => product.id === id) ?? null;
  }

  async create(data: ProductWriteData): Promise<ProductRecord> {
    const now = new Date().toISOString();
    const product: ProductRecord = { id: '00000000-0000-4000-8000-000000000099', ...data, createdAt: now, updatedAt: now };
    this.products.push(product);
    return product;
  }

  async update(id: string, data: ProductWriteData): Promise<ProductRecord | null> {
    const current = await this.findById(id);
    if (!current) return null;
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    this.products = this.products.map((product) => (product.id === id ? updated : product));
    return updated;
  }

  async setAvailability(id: string, isAvailable: boolean): Promise<ProductRecord | null> {
    const current = await this.findById(id);
    if (!current) return null;
    return this.update(id, { ...current, isAvailable });
  }

  async countBlockingOrders(): Promise<number> {
    return 0;
  }

  async delete(id: string): Promise<void> {
    this.products = this.products.filter((product) => product.id !== id);
  }
}

const validProduct = {
  name: 'Bowl de Frango',
  description: 'Frango grelhado com legumes e arroz.',
  price: 32.5,
  category: 'meal' satisfies Category,
  imageUrl: 'https://images.fastmeals.test/bowl.jpg',
  isAvailable: true,
  preparationTime: 20,
};

function buildApp(store: MemoryProductStore) {
  const app = express();
  app.use(express.json());
  const controller = createProductController(new ProductService(store));
  app.post('/api/products', controller.create);
  app.use(errorHandler);
  return app;
}

describe('produtos', () => {
  it('cria um produto válido', async () => {
    const store = new MemoryProductStore();
    const response = await request(buildApp(store)).post('/api/products').send(validProduct);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: 'Bowl de Frango', price: 32.5, category: 'meal' });
    expect(store.products).toHaveLength(1);
  });

  it('rejeita preço inválido e campos fora da regra', async () => {
    const store = new MemoryProductStore();
    const response = await request(buildApp(store)).post('/api/products').send({ ...validProduct, price: 0, name: 'AB' });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.map((detail: { field: string }) => detail.field)).toEqual(
      expect.arrayContaining(['name', 'price']),
    );
    expect(store.products).toHaveLength(0);
  });
});
