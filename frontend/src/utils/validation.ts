import { z } from 'zod';
import { parseMoney } from '@/utils/masks';

const phone = z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX');

const price = z
  .string()
  .trim()
  .min(1, 'Preço inválido')
  .transform((value, context) => {
    const amount = parseMoney(value);
    if (!Number.isFinite(amount)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Preço inválido' });
      return z.NEVER;
    }
    return amount;
  })
  .pipe(
    z
      .number()
      .positive('O preço deve ser maior que zero')
      .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6, 'O preço deve ter no máximo 2 casas decimais'),
  );

function requiredCoordinate(min: number, max: number, message: string) {
  return z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => Number.isFinite(Number(value)), message)
    .transform((value) => Number(value))
    .refine((value) => value >= min && value <= max, message);
}

function optionalCoordinate(min: number, max: number, message: string) {
  return z
    .string()
    .trim()
    .superRefine((value, context) => {
      if (value === '') return;
      const number = Number(value);
      if (!Number.isFinite(number) || number < min || number > max) {
        context.addIssue({ code: z.ZodIssueCode.custom, message });
      }
    })
    .transform((value) => (value === '' ? null : Number(value)));
}

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const productSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter entre 3 e 120 caracteres').max(120, 'Nome deve ter entre 3 e 120 caracteres'),
  description: z.string().trim().min(10, 'Descrição deve ter entre 10 e 500 caracteres').max(500, 'Descrição deve ter entre 10 e 500 caracteres'),
  price,
  category: z.enum(['meal', 'drink', 'dessert', 'side']),
  imageUrl: z.string().trim().url('URL da imagem inválida').or(z.literal('')),
  isAvailable: z.boolean(),
  preparationTime: z.coerce.number().int('Tempo entre 1 e 120 minutos').min(1, 'Tempo entre 1 e 120 minutos').max(120, 'Tempo entre 1 e 120 minutos'),
});

export const customerOrderSchema = z.object({
  customerName: z.string().trim().min(3, 'Nome deve ter entre 3 e 100 caracteres').max(100, 'Nome deve ter entre 3 e 100 caracteres'),
  customerPhone: phone,
  deliveryAddress: z.string().trim().min(10, 'Endereço deve ter entre 10 e 300 caracteres').max(300, 'Endereço deve ter entre 10 e 300 caracteres'),
  latitude: requiredCoordinate(-90, 90, 'Latitude inválida'),
  longitude: requiredCoordinate(-180, 180, 'Longitude inválida'),
});

export const courierSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter entre 3 e 100 caracteres').max(100, 'Nome deve ter entre 3 e 100 caracteres'),
  phone,
  vehicleType: z.enum(['bicycle', 'motorcycle', 'car']),
  isActive: z.boolean(),
  currentLatitude: optionalCoordinate(-90, 90, 'Latitude inválida'),
  currentLongitude: optionalCoordinate(-180, 180, 'Longitude inválida'),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const key = issue.path[0];
    if (typeof key === 'string' && !result[key]) result[key] = issue.message;
  });
  return result;
}
