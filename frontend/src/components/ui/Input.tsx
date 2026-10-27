import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid = false, className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-2xl border bg-white px-3 py-2 text-ink outline-none ring-ember/30 focus:ring-4 ${invalid ? 'border-clay' : 'border-sand'} ${className}`}
      {...props}
    />
  );
}
