import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-none border-2 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em]",
  {
    variants: {
      tone: {
        gold: "border-[color:var(--dl-badge-gold-border)] bg-[color:var(--dl-badge-gold-bg)] text-[color:var(--dl-badge-gold-text)]",
        maroon:
          "border-[color:var(--dl-badge-maroon-border)] bg-[color:var(--dl-badge-maroon-bg)] text-[color:var(--dl-badge-maroon-text)]",
        forest:
          "border-[color:var(--dl-badge-forest-border)] bg-[color:var(--dl-badge-forest-bg)] text-[color:var(--dl-badge-forest-text)]",
        neutral:
          "border-[color:var(--dl-badge-neutral-border)] bg-[color:var(--dl-badge-neutral-bg)] text-[color:var(--dl-badge-neutral-text)]",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
