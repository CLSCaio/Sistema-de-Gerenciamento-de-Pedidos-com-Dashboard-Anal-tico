import type { Prisma } from '@prisma/client';
import type { OrderStatus } from '../models/domain';
import type { OrderRecord } from '../models/records';
import type { CreateOrderInput } from '../models/schemas';
import { AppError } from '../utils/errors';
import { toDecimalNumber, toMoneyNumber } from '../utils/money';
import { prisma } from '../utils/prisma';
import {
  assertCourierCanTakeOrder,
  assertProductsAvailable,
  assertStatusTransition,
  calculateOrderTotal,
} from './order-rules';

const orderInclude = {
  deliveryPerson: { select: { name: true } },
  items: {
    select: {
      productId: true,
      productName: true,
      quantity: true,
      unitPrice: true,
      product: { select: { name: true } },
    },
  },
} satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export interface OrderListFilters {
  page: number;
  pageSize: number;
  status?: OrderStatus;
  sort: 'asc' | 'desc';
  start?: Date;
  end?: Date;
}

export interface ReadyOrderPoint {
  id: string;
  latitude: number;
  longitude: number;
}

export interface OrderStore {
  list(filters: OrderListFilters): Promise<{ items: OrderRecord[]; total: number }>;
  findById(id: string): Promise<OrderRecord | null>;
  create(input: CreateOrderInput): Promise<OrderRecord>;
  transition(id: string, status: OrderStatus, deliveryPersonId?: string): Promise<OrderRecord>;
  listReady(): Promise<ReadyOrderPoint[]>;
}

function mapOrder(row: OrderRow): OrderRecord {
  return {
    id: row.id,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    deliveryAddress: row.deliveryAddress,
    latitude: toDecimalNumber(row.latitude),
    longitude: toDecimalNumber(row.longitude),
    status: row.status,
    totalAmount: toMoneyNumber(row.totalAmount),
    deliveryPersonId: row.deliveryPersonId,
    deliveryPersonName: row.deliveryPerson?.name ?? null,
    items: row.items.map((item) => ({
      productId: item.productId,
      productName: item.product?.name ?? item.productName,
      quantity: item.quantity,
      unitPrice: toMoneyNumber(item.unitPrice),
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PrismaOrderStore implements OrderStore {
  async list(filters: OrderListFilters): Promise<{ items: OrderRecord[]; total: number }> {
    const where: Prisma.OrderWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.start || filters.end
        ? { createdAt: { ...(filters.start ? { gte: filters.start } : {}), ...(filters.end ? { lte: filters.end } : {}) } }
        : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: filters.sort },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.order.count({ where }),
    ]);
    return { items: rows.map(mapOrder), total };
  }

  async findById(id: string): Promise<OrderRecord | null> {
    const row = await prisma.order.findUnique({ where: { id }, include: orderInclude });
    return row ? mapOrder(row) : null;
  }

  async create(input: CreateOrderInput): Promise<OrderRecord> {
    return prisma.$transaction(async (tx) => {
      const ids = input.items.map((item) => item.productId);
      const products = await tx.product.findMany({ where: { id: { in: ids } } });
      assertProductsAvailable(
        products.map((product) => ({ id: product.id, isAvailable: product.isAvailable })),
        ids,
      );
      const byId = new Map(products.map((product) => [product.id, product]));
      const items = input.items.map((item) => {
        const product = byId.get(item.productId);
        if (!product) throw new AppError(404, 'NOT_FOUND', 'Produto não encontrado');
        return {
          productId: product.id,
          soldProductId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: toMoneyNumber(product.price),
        };
      });
      const created = await tx.order.create({
        data: {
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          deliveryAddress: input.deliveryAddress,
          latitude: input.latitude,
          longitude: input.longitude,
          status: 'pending',
          totalAmount: calculateOrderTotal(items).toFixed(2),
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              soldProductId: item.soldProductId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice.toFixed(2),
            })),
          },
          statusEvents: { create: { status: 'pending' } },
        },
        include: orderInclude,
      });
      return mapOrder(created);
    });
  }

  async transition(id: string, status: OrderStatus, deliveryPersonId?: string): Promise<OrderRecord> {
    return prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id } });
      if (!current) throw new AppError(404, 'NOT_FOUND', 'Pedido não encontrado');
      assertStatusTransition(current.status, status, deliveryPersonId);
      if (status === 'delivering') {
        if (!deliveryPersonId) {
          throw new AppError(422, 'DELIVERY_PERSON_REQUIRED', 'É obrigatório atribuir um entregador para iniciar a entrega');
        }
        const courier = await tx.deliveryPerson.findUnique({ where: { id: deliveryPersonId } });
        if (!courier) throw new AppError(404, 'NOT_FOUND', 'Entregador não encontrado');
        const deliveries = await tx.order.count({ where: { deliveryPersonId, status: 'delivering' } });
        assertCourierCanTakeOrder(courier.isActive, deliveries);
      }
      await tx.order.update({
        where: { id },
        data: status === 'delivering' ? { status, deliveryPersonId } : { status },
      });
      await tx.orderStatusEvent.create({ data: { orderId: id, status } });
      const updated = await tx.order.findUnique({ where: { id }, include: orderInclude });
      if (!updated) throw new AppError(404, 'NOT_FOUND', 'Pedido não encontrado');
      return mapOrder(updated);
    });
  }

  async listReady(): Promise<ReadyOrderPoint[]> {
    const rows = await prisma.order.findMany({
      where: { status: 'ready' },
      select: { id: true, latitude: true, longitude: true },
    });
    return rows.map((row) => ({
      id: row.id,
      latitude: toDecimalNumber(row.latitude),
      longitude: toDecimalNumber(row.longitude),
    }));
  }
}
