import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "uiButton",
        variant === "primary" && "uiButtonPrimary",
        variant === "secondary" && "uiButtonSecondary",
        variant === "ghost" && "uiButtonGhost",
        variant === "danger" && "uiButtonDanger",
        className
      )}
      {...props}
    />
  );
}
