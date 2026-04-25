import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-2xl border border-[color:var(--dl-sand)] bg-white/92 px-4 py-3 text-[0.95rem] text-[color:var(--dl-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition placeholder:text-[color:rgba(90,90,90,0.72)] focus:border-[color:var(--dl-gold)] focus:ring-4 focus:ring-[rgba(200,148,31,0.14)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
