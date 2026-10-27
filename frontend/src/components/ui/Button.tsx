import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary: 'bg-ember text-white hover:bg-orange-700',
  secondary: 'border border-sand bg-white text-ink hover:bg-sand',
  danger: 'bg-clay text-white hover:bg-red-900',
  ghost: 'bg-transparent text-ink hover:bg-sand',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  children: ReactNode;
}

export function Button({ variant = 'primary', className = '', children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
