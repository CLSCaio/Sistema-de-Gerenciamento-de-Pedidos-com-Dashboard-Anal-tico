import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-cream p-6 shadow-card">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Fechar">
            Fechar
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
