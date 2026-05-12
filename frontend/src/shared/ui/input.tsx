import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "uiInput",
        "flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        props.className
      )}
    />
  );
}
