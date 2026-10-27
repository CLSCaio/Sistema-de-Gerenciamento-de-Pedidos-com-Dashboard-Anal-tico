import { z } from 'zod';
import { hasAtMostTwoDecimals } from '../utils/money';
import { categories, orderStatuses, vehicleTypes } from './domain';

const phoneSchema = z
  .string()
  .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX');

const priceSchema = z
  .number({ required_error: 'Preço é obrigatório', invalid_type_error: 'Preço deve ser numérico' })
  .positive('O preço deve ser maior que zero')
  .refine(hasAtMostTwoDecimals, 'O preço deve ter no máximo 2 casas decimais');

const imageSchema = z
  .union([z.string().trim().url('URL da imagem inválida'), z.literal(''), z.null()])
  .optional()
  .transform((value) => value || null);

export const createProductSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter entre 3 e 120 caracteres').max(120, 'Nome deve ter entre 3 e 120 caracteres'),
  description: z
    .string()
    .trim()
    .min(10, 'Descrição deve ter entre 10 e 500 caracteres')
    .max(500, 'Descrição deve ter entre 10 e 500 caracteres'),
  price: priceSchema,
  category: z.enum(categories, { required_error: 'Categoria é obrigatória', invalid_type_error: 'Categoria inválida' }),
  imageUrl: imageSchema,
  isAvailable: z.boolean().optional(),
  preparationTime: z
    .number({ required_error: 'Tempo de preparo é obrigatório', invalid_type_error: 'Tempo de preparo deve ser inteiro' })
    .int('Tempo de preparo deve ser inteiro')
    .min(1, 'Tempo de preparo deve estar entre 1 e 120 minutos')
    .max(120, 'Tempo de preparo deve estar entre 1 e 120 minutos'),
});

export const updateProductSchema = createProductSchema;
export const availabilitySchema = z.object({
  isAvailable: z.boolean({ required_error: 'Disponibilidade é obrigatória' }),
});

export const productListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().max(120).optional(),
  category: z.enum(categories).optional(),
  isAvailable: z.enum(['true', 'false']).optional(),
  includeUnavailable: z.enum(['true', 'false']).optional(),
});

const orderItemSchema = z.object({
  productId: z.string().uuid('Produto inválido'),
  quantity: z.number().int().positive('Quantidade deve ser maior que zero').max(99, 'Quantidade máxima é 99'),
});

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(3, 'Nome do cliente deve ter entre 3 e 100 caracteres').max(100),
  customerPhone: phoneSchema,
  deliveryAddress: z.string().trim().min(10, 'Endereço deve ter entre 10 e 300 caracteres').max(300),
  latitude: z.number().gte(-90, 'Latitude inválida').lte(90, 'Latitude inválida'),
  longitude: z.number().gte(-180, 'Longitude inválida').lte(180, 'Longitude inválida'),
  items: z.array(orderItemSchema).min(1, 'O pedido precisa de ao menos um item').max(30).superRefine((items, context) => {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      if (seen.has(item.productId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, 'productId'],
          message: 'Produto duplicado no pedido',
        });
      }
      seen.add(item.productId);
    });
  }),
});

export const orderListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(orderStatuses).optional(),
  sort: z.enum(['asc', 'desc']).default('desc'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inicial inválida').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final inválida').optional(),
});

export const statusChangeSchema = z.object({
  status: z.enum(orderStatuses, { required_error: 'Status é obrigatório' }),
  deliveryPersonId: z.string().uuid('Entregador inválido').optional(),
});

export const acceptAssignmentSchema = z.object({
  orderId: z.string().uuid('Pedido inválido'),
  deliveryPersonId: z.string().uuid('Entregador inválido'),
});

export const deliveryPersonSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter entre 3 e 100 caracteres').max(100),
  phone: phoneSchema,
  vehicleType: z.enum(vehicleTypes, { required_error: 'Tipo de veículo é obrigatório' }),
  isActive: z.boolean().optional(),
  currentLatitude: z.number().gte(-90).lte(90).nullable().optional(),
  currentLongitude: z.number().gte(-180).lte(180).nullable().optional(),
});

export const deliveryPersonListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  isActive: z.enum(['true', 'false']).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const reportQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inicial inválida'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final inválida'),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Identificador inválido'),
});

export type CreateProductInput = z.output<typeof createProductSchema>;
export type ProductListQuery = z.output<typeof productListSchema>;
export type CreateOrderInput = z.output<typeof createOrderSchema>;
export type OrderListQuery = z.output<typeof orderListSchema>;
export type StatusChangeInput = z.output<typeof statusChangeSchema>;
export type DeliveryPersonInput = z.output<typeof deliveryPersonSchema>;
export type DeliveryPersonListQuery = z.output<typeof deliveryPersonListSchema>;
export type LoginInput = z.output<typeof loginSchema>;
export type ReportQuery = z.output<typeof reportQuerySchema>;
