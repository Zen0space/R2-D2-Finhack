import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-[var(--dl-radius-control)] border-2 border-[color:var(--dl-input-border)] bg-[color:var(--dl-input-bg)] px-4 text-[0.95rem] text-[color:var(--dl-ink)] shadow-[var(--dl-input-shadow)] outline-none transition placeholder:text-[color:var(--dl-input-placeholder)] focus:border-[color:var(--dl-focus-color)] focus:ring-4 focus:ring-[var(--dl-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
