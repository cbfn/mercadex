import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("uiInput", props.className)} />;
}
