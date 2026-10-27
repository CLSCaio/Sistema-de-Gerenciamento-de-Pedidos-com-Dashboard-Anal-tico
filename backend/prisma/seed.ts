import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient, type OrderStatus } from '@prisma/client';
import { z } from 'zod';
import { hashPassword } from '../src/utils/password';
import { roundMoney } from '../src/utils/money';

const prisma = new PrismaClient();

const seedFileSchema = z.object({
  users: z.array(z.object({ email: z.string().email(), password: z.string().min(1), role: z.enum(['admin', 'viewer']) })),
  products: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string(),
      price: z.number().positive(),
      category: z.enum(['meal', 'drink', 'dessert', 'side']),
      imageUrl: z.string().nullable(),
      isAvailable: z.boolean(),
      preparationTime: z.number().int(),
    }),
  ),
  deliveryPersons: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      phone: z.string(),
      vehicleType: z.enum(['bicycle', 'motorcycle', 'car']),
      isActive: z.boolean(),
      currentLatitude: z.number().nullable(),
      currentLongitude: z.number().nullable(),
    }),
  ),
  orders: z.array(
    z.object({
      id: z.string().uuid(),
      customerName: z.string(),
      customerPhone: z.string(),
      deliveryAddress: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      status: z.enum(['pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled']),
      deliveryPersonId: z.string().uuid().nullable(),
      createdAt: z.string(),
      items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().positive() })),
    }),
  ),
});

const statusChain: Record<OrderStatus, OrderStatus[]> = {
  pending: ['pending'],
  preparing: ['pending', 'preparing'],
  ready: ['pending', 'preparing', 'ready'],
  delivering: ['pending', 'preparing', 'ready', 'delivering'],
  delivered: ['pending', 'preparing', 'ready', 'delivering', 'delivered'],
  cancelled: ['pending', 'cancelled'],
};

async function main(): Promise<void> {
  const seedPath = process.env.SEED_PATH ?? path.resolve(__dirname, '../../seed/data.json');
  const raw = await readFile(seedPath, 'utf8');
  const data = seedFileSchema.parse(JSON.parse(raw));
  const productsById = new Map(data.products.map((product) => [product.id, product]));

  for (const user of data.users) {
    const passwordHash = await hashPassword(user.password);
    await prisma.user.upsert({
      where: { email: user.email.toLowerCase() },
      update: { passwordHash, role: user.role },
      create: { email: user.email.toLowerCase(), passwordHash, role: user.role },
    });
  }

  for (const product of data.products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: { ...product, price: product.price.toFixed(2) },
      create: { ...product, price: product.price.toFixed(2) },
    });
  }

  for (const person of data.deliveryPersons) {
    await prisma.deliveryPerson.upsert({
      where: { id: person.id },
      update: person,
      create: person,
    });
  }

  for (const order of data.orders) {
    const items = order.items.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) throw new Error(`Produto ${item.productId} não existe no seed`);
      return {
        productId: product.id,
        soldProductId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price.toFixed(2),
      };
    });
    const totalAmount = roundMoney(
      order.items.reduce((sum, item) => sum + (productsById.get(item.productId)?.price ?? 0) * item.quantity, 0),
    ).toFixed(2);
    const createdAt = new Date(order.createdAt);
    const payload = {
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      latitude: order.latitude,
      longitude: order.longitude,
      status: order.status,
      totalAmount,
      deliveryPersonId: order.deliveryPersonId,
      createdAt,
    };
    await prisma.order.upsert({
      where: { id: order.id },
      update: payload,
      create: { id: order.id, ...payload },
    });
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.orderItem.createMany({ data: items.map((item) => ({ ...item, orderId: order.id })) });
    await prisma.orderStatusEvent.deleteMany({ where: { orderId: order.id } });
    const chain = statusChain[order.status];
    await prisma.orderStatusEvent.createMany({
      data: chain.map((status, index) => ({
        orderId: order.id,
        status,
        createdAt: new Date(createdAt.getTime() + index * 8 * 60 * 1000),
      })),
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
