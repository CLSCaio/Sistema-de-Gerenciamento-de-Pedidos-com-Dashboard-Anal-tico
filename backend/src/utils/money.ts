export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function hasAtMostTwoDecimals(value: number): boolean {
  const scaled = value * 100;
  return Math.abs(scaled - Math.round(scaled)) < 1e-8;
}

export function toDecimalNumber(value: { toString(): string } | number | string): number {
  return Number(value.toString());
}

export function toMoneyNumber(value: { toString(): string } | number | string): number {
  return roundMoney(toDecimalNumber(value));
}
