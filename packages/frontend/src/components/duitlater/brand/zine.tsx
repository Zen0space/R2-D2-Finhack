import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ZineColor = "teal" | "brick" | "forest" | "burnt" | "paper" | "ink" | "cream";

const zineColorVar: Record<ZineColor, string> = {
  teal: "var(--dl-zine-teal)",
  brick: "var(--dl-zine-brick)",
  forest: "var(--dl-zine-forest)",
  burnt: "var(--dl-zine-burnt)",
  paper: "var(--dl-zine-paper)",
  cream: "var(--dl-zine-paper)",
  ink: "var(--dl-zine-ink)",
};

export function Logo({
  className,
  width = 220,
  priority = false,
}: {
  className?: string;
  width?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/logo.webp"
      alt="DuitLater"
      width={width}
      height={Math.round(width * (423 / 1224))}
      priority={priority}
      className={cn("h-auto select-none", className)}
      style={{ width, height: "auto" }}
    />
  );
}

export function BrushHeadline({
  children,
  color = "brick",
  rotate = -2,
  className,
  size = "xl",
  as: Tag = "span",
}: {
  children: ReactNode;
  color?: ZineColor;
  rotate?: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const sizeClass = {
    sm: "text-3xl md:text-4xl",
    md: "text-4xl md:text-5xl",
    lg: "text-5xl md:text-6xl",
    xl: "text-6xl md:text-7xl",
    "2xl": "text-7xl md:text-8xl",
    "3xl": "text-8xl md:text-[10rem]",
  }[size];

  return (
    <Tag
      className={cn("zine-brush inline-block", sizeClass, className)}
      style={{
        color: zineColorVar[color],
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children}
    </Tag>
  );
}

export function ScribbleCircle({
  className,
  color = "brick",
  size = 220,
  variant = "loop",
  style,
}: {
  className?: string;
  color?: ZineColor;
  size?: number;
  variant?: "loop" | "double" | "swoosh";
  style?: CSSProperties;
}) {
  const stroke = zineColorVar[color];
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 240 240"
      className={cn("zine-scribble", className)}
      style={style}
      fill="none"
    >
      {variant === "loop" && (
        <path
          d="M120 30 C 60 30, 25 75, 30 130 C 35 185, 90 215, 145 205 C 200 195, 220 145, 210 100 C 200 55, 150 35, 110 45"
          stroke={stroke}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.85}
        />
      )}
      {variant === "double" && (
        <>
          <path
            d="M118 28 C 58 28, 23 73, 28 128 C 33 183, 88 213, 143 203 C 198 193, 218 143, 208 98 C 198 53, 148 33, 108 43"
            stroke={stroke}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.85}
          />
          <path
            d="M125 38 C 70 38, 38 80, 42 130 C 46 180, 92 207, 142 198 C 192 189, 210 145, 200 105 C 192 65, 150 48, 115 56"
            stroke={stroke}
            strokeWidth={3.5}
            strokeLinecap="round"
            opacity={0.6}
          />
        </>
      )}
      {variant === "swoosh" && (
        <path
          d="M20 130 C 40 60, 130 30, 200 70 C 230 90, 230 140, 195 170 C 150 205, 60 200, 25 150"
          stroke={stroke}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.85}
        />
      )}
    </svg>
  );
}

export function TornCard({
  children,
  className,
  rotate = "none",
  bg = "cream",
  torn = true,
}: {
  children: ReactNode;
  className?: string;
  rotate?: "none" | "l" | "r" | "l-strong" | "r-strong";
  bg?: ZineColor;
  torn?: boolean;
}) {
  const rotateClass = {
    none: "",
    l: "zine-card-rotate-l",
    r: "zine-card-rotate-r",
    "l-strong": "zine-card-rotate-l-strong",
    "r-strong": "zine-card-rotate-r-strong",
  }[rotate];

  return (
    <div
      className={cn("zine-card", torn && "zine-card-torn", rotateClass, className)}
      style={{ background: zineColorVar[bg] }}
    >
      {children}
    </div>
  );
}

export function NumberedTab({
  number,
  title,
  children,
  className,
  rotate = 0,
}: {
  number: number | string;
  title: string;
  children?: ReactNode;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={cn("zine-tab flex-col items-start", className)}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <div className="flex items-baseline gap-3">
        <span className="zine-tab-number">{number}</span>
        <span className="text-2xl md:text-3xl">{title}</span>
      </div>
      {children ? <p className="text-sm font-normal normal-case opacity-90">{children}</p> : null}
    </div>
  );
}

export function StatChip({
  figure,
  caption,
  className,
  rotate = 0,
}: {
  figure: ReactNode;
  caption: ReactNode;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={cn("zine-stat", className)}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <div className="zine-stat-figure">{figure}</div>
      <div className="zine-stat-caption">{caption}</div>
    </div>
  );
}

/** Full-bleed colored zine section — paper grain over brand color. */
export function ZineSection({
  color = "paper",
  className,
  children,
  id,
}: {
  color?: ZineColor;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative overflow-hidden scroll-mt-20", className)}
      style={{ background: zineColorVar[color] }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(31,31,26,0.06) 2px, rgba(31,31,26,0.06) 3px), repeating-linear-gradient(90deg, transparent 0, transparent 2px, rgba(31,31,26,0.05) 2px, rgba(31,31,26,0.05) 3px)",
        }}
      />
      <div className="relative">{children}</div>
    </section>
  );
}
