export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function maskMoney(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (!digits) return '';
  const cents = digits.padStart(3, '0');
  const whole = cents.slice(0, -2).replace(/^0+(?=\d)/, '');
  const fraction = cents.slice(-2);
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${grouped},${fraction}`;
}

export function parseMoney(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return Number.NaN;
  const normalized = trimmed.includes(',') ? trimmed.replace(/\./g, '').replace(',', '.') : trimmed;
  return Number(normalized);
}

export function formatMoneyInput(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function maskDecimal(value: string, maxFraction = 6): string {
  const negative = value.trim().startsWith('-');
  const unsigned = value.replace(',', '.').replace(/-/g, '').replace(/[^\d.]/g, '');
  const dot = unsigned.indexOf('.');
  const whole = (dot === -1 ? unsigned : unsigned.slice(0, dot)).slice(0, 3);
  const fraction = dot === -1 ? '' : unsigned.slice(dot + 1).replace(/\./g, '').slice(0, maxFraction);
  if (!whole && dot === -1) return negative ? '-' : '';
  return `${negative ? '-' : ''}${whole}${dot === -1 ? '' : `.${fraction}`}`;
}

export function maskInteger(value: string, maxDigits: number): string {
  return value.replace(/\D/g, '').slice(0, maxDigits);
}

export function dateRangeError(startDate: string, endDate: string): string | undefined {
  if (startDate && endDate && startDate > endDate) return 'A data inicial não pode ser maior que a final';
  return undefined;
}
