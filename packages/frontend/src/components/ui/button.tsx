import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition-colors duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-[color:var(--dl-gold)] text-[color:var(--dl-ink)] shadow-[0_12px_24px_rgba(200,148,31,0.18)] hover:bg-[color:var(--dl-gold-dark)] hover:text-white",
        secondary:
          "border-transparent bg-[color:var(--dl-maroon)] text-white hover:bg-[color:#5f2323]",
        outline:
          "border-[color:var(--dl-sand)] bg-white/80 text-[color:var(--dl-ink)] hover:border-[color:var(--dl-gold)] hover:text-[color:var(--dl-gold-dark)]",
        ghost:
          "border-transparent bg-transparent text-[color:var(--dl-maroon)] hover:bg-[color:rgba(122,46,46,0.08)]",
      },
      size: {
        sm: "h-10 px-4",
        default: "h-12 px-5",
        lg: "h-14 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, size, type = "button", variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} type={type} {...props} />;
}
