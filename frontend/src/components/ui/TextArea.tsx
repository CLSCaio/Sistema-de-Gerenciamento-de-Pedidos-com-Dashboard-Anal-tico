import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function TextArea({ invalid = false, className = '', ...props }: TextAreaProps) {
  return (
    <textarea
      className={`min-h-28 w-full rounded-2xl border bg-white px-3 py-2 text-ink outline-none ring-ember/30 focus:ring-4 ${invalid ? 'border-clay' : 'border-sand'} ${className}`}
      {...props}
    />
  );
}
