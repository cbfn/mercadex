import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-3xl rounded-xl border bg-card text-card-foreground shadow-2xl">
        <header className="flex items-center justify-between border-b p-4">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Fechar modal" className="rounded-md px-2 py-1 hover:bg-muted">
            X
          </button>
        </header>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
