import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-[color:var(--dl-sand)] bg-white/86 p-0 text-[color:var(--dl-ink)] shadow-[var(--dl-shadow)] backdrop-blur-[18px]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-2 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-3xl text-[color:var(--dl-ink)]", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-[color:var(--dl-slate)]", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
