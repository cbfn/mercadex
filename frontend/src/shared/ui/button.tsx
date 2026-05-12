import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-sm hover:brightness-95",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        danger: "bg-red-500 text-white hover:bg-red-600"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  const resolvedVariant = variant ?? "primary";

  return (
    <button
      className={cn(
        "uiButton",
        resolvedVariant === "primary" && "uiButtonPrimary",
        resolvedVariant === "secondary" && "uiButtonSecondary",
        resolvedVariant === "ghost" && "uiButtonGhost",
        resolvedVariant === "danger" && "uiButtonDanger",
        buttonVariants({ variant, size }),
        className
      )}
      {...props}
    />
  );
}
