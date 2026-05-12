import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ open, title, onClose, children }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <aside className={cn("absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl")} aria-label={title}>
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar carrinho"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
          >
            <X size={20} />
          </button>
        </header>
        <div className="h-[calc(100%-73px)] overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}
