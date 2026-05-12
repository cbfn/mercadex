import type { SelectHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("uiSelect", props.className)} />;
}
