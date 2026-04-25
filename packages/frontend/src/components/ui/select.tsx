import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 w-full rounded-[var(--dl-radius-control)] border border-[color:var(--dl-input-border)] bg-[color:var(--dl-input-bg)] px-4 text-[0.95rem] text-[color:var(--dl-ink)] shadow-[var(--dl-input-shadow)] outline-none transition focus:border-[color:var(--dl-focus-color)] focus:ring-4 focus:ring-[var(--dl-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
