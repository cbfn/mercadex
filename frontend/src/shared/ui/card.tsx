import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("uiCard", props.className)} />;
}
