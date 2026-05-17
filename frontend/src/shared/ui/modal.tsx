import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  overlayClassName?: string;
  panelClassName?: string;
  bodyClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  closeButtonClassName?: string;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  overlayClassName,
  panelClassName,
  bodyClassName,
  headerClassName,
  titleClassName,
  closeButtonClassName,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4",
        overlayClassName
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={cn("w-full max-w-3xl rounded-xl border bg-card text-card-foreground shadow-2xl", panelClassName)}>
        <header className={cn("flex items-center justify-between border-b p-4", headerClassName)}>
          <h2 className={cn("font-display text-xl font-semibold", titleClassName)}>{title}</h2>
          <button onClick={onClose} aria-label="Fechar modal" className={cn("rounded-md px-2 py-1 hover:bg-muted", closeButtonClassName)}>
            X
          </button>
        </header>
        <div className={cn("p-4", bodyClassName)}>{children}</div>
      </div>
    </div>
  );
}
