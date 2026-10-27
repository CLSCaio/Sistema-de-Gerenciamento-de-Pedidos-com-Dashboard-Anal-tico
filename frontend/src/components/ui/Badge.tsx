import type { ReactNode } from 'react';

interface BadgeProps {
  tone: string;
  children: ReactNode;
}

export function Badge({ tone, children }: BadgeProps) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>{children}</span>;
}
