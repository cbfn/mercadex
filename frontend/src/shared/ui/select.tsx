import type { SelectHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "uiSelect",
        "flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        props.className
      )}
    />
  );
}
