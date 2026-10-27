import type { InputHTMLAttributes } from 'react';

export function Checkbox({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className={`h-4 w-4 accent-ember ${className}`} {...props} />;
}
