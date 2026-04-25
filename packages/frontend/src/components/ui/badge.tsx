import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em]",
  {
    variants: {
      tone: {
        gold: "border-[color:rgba(200,148,31,0.34)] bg-[color:rgba(200,148,31,0.12)] text-[color:var(--dl-gold-dark)]",
        maroon:
          "border-[color:rgba(122,46,46,0.2)] bg-[color:rgba(122,46,46,0.08)] text-[color:var(--dl-maroon)]",
        forest:
          "border-[color:rgba(47,106,63,0.22)] bg-[color:rgba(47,106,63,0.1)] text-[color:var(--dl-forest)]",
        neutral:
          "border-[color:var(--dl-sand)] bg-white/80 text-[color:var(--dl-slate)]",
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
