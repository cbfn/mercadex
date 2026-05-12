import type { ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ open, title, onClose, children }: DrawerProps) {
  if (!open) return null;

  return (
    <aside className="drawer" aria-label={title}>
      <header className="drawerHeader">
        <h2>{title}</h2>
        <button onClick={onClose} aria-label="Fechar carrinho">
          X
        </button>
      </header>
      <div className="drawerBody">{children}</div>
    </aside>
  );
}
