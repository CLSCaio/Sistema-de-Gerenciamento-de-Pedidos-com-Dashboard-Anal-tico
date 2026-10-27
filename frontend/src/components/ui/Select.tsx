import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ invalid = false, className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full rounded-2xl border bg-white px-3 py-2 text-ink outline-none ring-ember/30 focus:ring-4 ${invalid ? 'border-clay' : 'border-sand'} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
