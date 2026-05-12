import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button className={cn("tabButton", active && "tabButtonActive")} onClick={onClick}>
      {children}
    </button>
  );
}
