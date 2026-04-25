import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
  children: ReactNode;
  className?: string | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  htmlFor: string;
  label: string;
  required?: boolean;
};

export function Field({ children, className, error, hint, htmlFor, label, required }: FieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-[color:var(--dl-ink)]" htmlFor={htmlFor}>
          {label}
          {required ? <span className="text-[color:var(--dl-maroon)]"> *</span> : null}
        </label>
        {hint ? <span className="text-xs text-[color:var(--dl-slate)]">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-sm text-[color:var(--dl-error)]">{error}</p> : null}
    </div>
  );
}
