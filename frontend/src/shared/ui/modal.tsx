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
    <div className="overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modalCard">
        <header className="modalHeader">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Fechar modal">
            X
          </button>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
}
