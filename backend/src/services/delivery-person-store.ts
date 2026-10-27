import type { Prisma } from '@prisma/client';
import type { VehicleType } from '../models/domain';
import type { DeliveryPersonRecord } from '../models/records';
import { AppError } from '../utils/errors';
import { toDecimalNumber } from '../utils/money';
import { prisma } from '../utils/prisma';

export interface DeliveryPersonWriteData {
  name: string;
  phone: string;
  vehicleType: VehicleType;
  isActive: boolean;
  currentLatitude: number | null;
  currentLongitude: number | null;
}

export interface DeliveryPersonFilters {
  page: number;
  pageSize: number;
  isActive?: boolean;
}

export interface AvailableCourier {
  id: string;
  latitude: number;
  longitude: number;
}

export interface DeliveryPersonStore {
  list(filters: DeliveryPersonFilters): Promise<{ items: DeliveryPersonRecord[]; total: number }>;
  findById(id: string): Promise<DeliveryPersonRecord | null>;
  create(data: DeliveryPersonWriteData): Promise<DeliveryPersonRecord>;
  update(id: string, data: DeliveryPersonWriteData): Promise<DeliveryPersonRecord | null>;
  countOrders(id: string): Promise<number>;
  delete(id: string): Promise<void>;
  listAvailable(): Promise<AvailableCourier[]>;
}

function mapCourier(row: {
  id: string;
  name: string;
  phone: string;
  vehicleType: VehicleType;
  isActive: boolean;
  currentLatitude: Prisma.Decimal | null;
  currentLongitude: Prisma.Decimal | null;
  createdAt: Date;
}): DeliveryPersonRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    vehicleType: row.vehicleType,
    isActive: row.isActive,
    currentLatitude: row.currentLatitude === null ? null : toDecimalNumber(row.currentLatitude),
    currentLongitude: row.currentLongitude === null ? null : toDecimalNumber(row.currentLongitude),
    createdAt: row.createdAt.toISOString(),
  };
}

export class PrismaDeliveryPersonStore implements DeliveryPersonStore {
  async list(filters: DeliveryPersonFilters): Promise<{ items: DeliveryPersonRecord[]; total: number }> {
    const where: Prisma.DeliveryPersonWhereInput = filters.isActive === undefined ? {} : { isActive: filters.isActive };
    const [rows, total] = await Promise.all([
      prisma.deliveryPerson.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.deliveryPerson.count({ where }),
    ]);
    return { items: rows.map(mapCourier), total };
  }

  async findById(id: string): Promise<DeliveryPersonRecord | null> {
    const row = await prisma.deliveryPerson.findUnique({ where: { id } });
    return row ? mapCourier(row) : null;
  }

  create(data: DeliveryPersonWriteData): Promise<DeliveryPersonRecord> {
    return prisma.deliveryPerson.create({ data }).then(mapCourier);
  }

  async update(id: string, data: DeliveryPersonWriteData): Promise<DeliveryPersonRecord | null> {
    try {
      const row = await prisma.deliveryPerson.update({ where: { id }, data });
      return mapCourier(row);
    } catch (error) {
      if (isMissingRecord(error)) return null;
      throw error;
    }
  }

  countOrders(id: string): Promise<number> {
    return prisma.order.count({ where: { deliveryPersonId: id } });
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.deliveryPerson.delete({ where: { id } });
    } catch (error) {
      if (isMissingRecord(error)) throw new AppError(404, 'NOT_FOUND', 'Entregador não encontrado');
      throw error;
    }
  }

  async listAvailable(): Promise<AvailableCourier[]> {
    const rows = await prisma.deliveryPerson.findMany({
      where: {
        isActive: true,
        currentLatitude: { not: null },
        currentLongitude: { not: null },
        orders: { none: { status: 'delivering' } },
      },
      select: { id: true, currentLatitude: true, currentLongitude: true },
    });
    return rows.flatMap((row) => {
      if (row.currentLatitude === null || row.currentLongitude === null) return [];
      return [{ id: row.id, latitude: toDecimalNumber(row.currentLatitude), longitude: toDecimalNumber(row.currentLongitude) }];
    });
  }
}

function isMissingRecord(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025';
}
