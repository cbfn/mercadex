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
        "uiBadge inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variant === "neutral" && "uiBadgeNeutral bg-muted text-foreground",
        variant === "success" && "uiBadgeSuccess bg-emerald-100 text-emerald-800",
        variant === "info" && "uiBadgeInfo bg-sky-100 text-sky-800",
        variant === "warning" && "uiBadgeWarning bg-amber-100 text-amber-800",
        className
      )}
    />
  );
}
