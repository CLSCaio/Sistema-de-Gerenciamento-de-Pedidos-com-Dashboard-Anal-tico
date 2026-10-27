import type { ReactNode } from 'react';

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl text-ink">{title}</h1>
        <p className="mt-1 max-w-2xl text-mist">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-orange-100 px-4 py-3 text-sm text-clay">{children}</p>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-3xl border border-dashed border-sand px-4 py-10 text-center text-mist">{children}</p>;
}
