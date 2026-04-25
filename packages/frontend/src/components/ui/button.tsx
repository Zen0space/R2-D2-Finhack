import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--dl-radius-control)] border-2 text-sm font-semibold transition-all duration-150 focus-visible:outline-none active:translate-x-px active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "border-[color:var(--dl-button-primary-border)] bg-[color:var(--dl-button-primary-bg)] text-[color:var(--dl-button-primary-text)] shadow-[var(--dl-button-primary-shadow)] hover:bg-[color:var(--dl-button-primary-hover-bg)] hover:text-[color:var(--dl-button-primary-hover-text)]",
        secondary:
          "border-[color:var(--dl-button-secondary-border)] bg-[color:var(--dl-button-secondary-bg)] text-[color:var(--dl-button-secondary-text)] shadow-[var(--dl-button-secondary-shadow)] hover:bg-[color:var(--dl-button-secondary-hover-bg)]",
        outline:
          "border-[color:var(--dl-button-outline-border)] bg-[color:var(--dl-button-outline-bg)] text-[color:var(--dl-button-outline-text)] shadow-[var(--dl-button-outline-shadow)] hover:border-[color:var(--dl-button-outline-hover-border)] hover:text-[color:var(--dl-button-outline-hover-text)]",
        ghost:
          "border-[color:var(--dl-button-ghost-border)] bg-[color:var(--dl-button-ghost-bg)] text-[color:var(--dl-button-ghost-text)] hover:bg-[color:var(--dl-button-ghost-hover-bg)]",
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
