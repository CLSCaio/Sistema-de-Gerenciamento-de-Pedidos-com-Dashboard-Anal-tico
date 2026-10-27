import type { Prisma } from '@prisma/client';
import type { Category } from '../models/domain';
import type { ProductRecord } from '../models/records';
import { AppError } from '../utils/errors';
import { toMoneyNumber } from '../utils/money';
import { prisma } from '../utils/prisma';

export interface ProductWriteData {
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string | null;
  isAvailable: boolean;
  preparationTime: number;
}

export interface ProductListFilters {
  page: number;
  pageSize: number;
  search?: string;
  category?: Category;
  isAvailable?: boolean;
}

export interface ProductStore {
  list(filters: ProductListFilters): Promise<{ items: ProductRecord[]; total: number }>;
  findById(id: string): Promise<ProductRecord | null>;
  create(data: ProductWriteData): Promise<ProductRecord>;
  update(id: string, data: ProductWriteData): Promise<ProductRecord | null>;
  setAvailability(id: string, isAvailable: boolean): Promise<ProductRecord | null>;
  countBlockingOrders(id: string): Promise<number>;
  delete(id: string): Promise<void>;
}

function mapProduct(row: {
  id: string;
  name: string;
  description: string;
  price: Prisma.Decimal;
  category: Category;
  imageUrl: string | null;
  isAvailable: boolean;
  preparationTime: number;
  createdAt: Date;
  updatedAt: Date;
}): ProductRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: toMoneyNumber(row.price),
    category: row.category,
    imageUrl: row.imageUrl,
    isAvailable: row.isAvailable,
    preparationTime: row.preparationTime,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PrismaProductStore implements ProductStore {
  async list(filters: ProductListFilters): Promise<{ items: ProductRecord[]; total: number }> {
    const where: Prisma.ProductWhereInput = {
      ...(filters.search ? { name: { contains: filters.search, mode: 'insensitive' } } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.isAvailable === undefined ? {} : { isAvailable: filters.isAvailable }),
    };
    const [rows, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.product.count({ where }),
    ]);
    return { items: rows.map(mapProduct), total };
  }

  async findById(id: string): Promise<ProductRecord | null> {
    const row = await prisma.product.findUnique({ where: { id } });
    return row ? mapProduct(row) : null;
  }

  async create(data: ProductWriteData): Promise<ProductRecord> {
    const row = await prisma.product.create({ data: { ...data, price: data.price.toFixed(2) } });
    return mapProduct(row);
  }

  async update(id: string, data: ProductWriteData): Promise<ProductRecord | null> {
    try {
      const row = await prisma.product.update({ where: { id }, data: { ...data, price: data.price.toFixed(2) } });
      return mapProduct(row);
    } catch (error) {
      if (isMissingRecord(error)) return null;
      throw error;
    }
  }

  async setAvailability(id: string, isAvailable: boolean): Promise<ProductRecord | null> {
    try {
      const row = await prisma.product.update({ where: { id }, data: { isAvailable } });
      return mapProduct(row);
    } catch (error) {
      if (isMissingRecord(error)) return null;
      throw error;
    }
  }

  async countBlockingOrders(id: string): Promise<number> {
    return prisma.orderItem.count({
      where: { productId: id, order: { status: { in: ['pending', 'preparing'] } } },
    });
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.product.delete({ where: { id } });
    } catch (error) {
      if (isMissingRecord(error)) {
        throw new AppError(404, 'NOT_FOUND', 'Produto não encontrado');
      }
      throw error;
    }
  }
}

function isMissingRecord(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025';
}
