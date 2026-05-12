import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "neutral" | "success" | "info" | "warning";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "uiBadge",
        variant === "neutral" && "uiBadgeNeutral",
        variant === "success" && "uiBadgeSuccess",
        variant === "info" && "uiBadgeInfo",
        variant === "warning" && "uiBadgeWarning",
        className
      )}
    />
  );
}
