import type { Category, OrderStatus, VehicleType } from '@/types/api';

export const categoryLabels: Record<Category, string> = {
  meal: 'Refeição',
  drink: 'Bebida',
  dessert: 'Sobremesa',
  side: 'Acompanhamento',
};

export const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendente',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivering: 'Em entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export const vehicleLabels: Record<VehicleType, string> = {
  bicycle: 'Bicicleta',
  motorcycle: 'Moto',
  car: 'Carro',
};

export const statusTone: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-950',
  preparing: 'bg-sky-100 text-sky-950',
  ready: 'bg-violet-100 text-violet-950',
  delivering: 'bg-orange-100 text-orange-950',
  delivered: 'bg-emerald-100 text-emerald-950',
  cancelled: 'bg-stone-200 text-stone-700',
};

export function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(value));
}

export function formatDateInput(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(date);
}

export function defaultReportRange(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
  return { startDate: formatDateInput(start), endDate: formatDateInput(end) };
}
