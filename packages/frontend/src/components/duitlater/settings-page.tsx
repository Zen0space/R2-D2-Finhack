"use client";

import { Sparkles } from "lucide-react";
import { BrushHeadline, Logo, ScribbleCircle } from "@/components/duitlater/brand/zine";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { designLanguages } from "@/lib/design-language/config";

const palette = [
  { name: "Teal", value: "#2A4F4A", role: "Primary surface · trust · NADI" },
  { name: "Cream paper", value: "#F5F0DC", role: "Body bg · paper grain" },
  { name: "Brick", value: "#B53028", role: "Brand accent · scribbles · errors" },
  { name: "Forest", value: "#3F5F3F", role: "Numbered tabs · pool steps" },
  { name: "Burnt orange", value: "#D85A2C", role: "Highlights · CTAs · selection" },
  { name: "Ink", value: "#1F1F1A", role: "Borders · body text · shadows" },
] as const;

type FontEntry = {
  name: string;
  role: string;
  sample: string;
  variant?: "brush" | "mono";
};

const fonts: FontEntry[] = [
  { name: "Anton", role: "Display · headlines · zine-display utility", sample: "RM300 DOESN'T BUY A SEWING MACHINE" },
  {
    name: "Splatink",
    role: "Brush · emotional accents · zine-brush utility",
    sample: "Sendiri tak mampu, ramai-ramai boleh!?",
    variant: "brush",
  },
  { name: "Inter", role: "Body · UI text · forms · descriptions", sample: "Pool kelompok B40 · combine TNG PayLater · AI Penasihat picks from MyKasih." },
  { name: "JetBrains Mono", role: "Code · data figures · tabular numbers", sample: "RM 1,800.00", variant: "mono" },
];

const principles = [
  {
    title: "Brutalist scaffolding",
    body: "Square corners (2px), 2px ink borders, hard offset shadows (no blur), flat color blocks. No glass, no gradient.",
  },
  {
    title: "Zine identity",
    body: "Splatink brush headlines for emotional beats. Hand-drawn red scribble loops as decorative accents. Paper grain bg.",
  },
  {
    title: "SaaS structure",
    body: "Predictable header · footer · main grid. Dense info hierarchy. Hover/focus states. Accessibility-first.",
  },
] as const;

export function SettingsPage() {
  const language = designLanguages[0];

  return (
    <main className="px-4 py-8 sm:px-6 lg:py-12">
      <div className="page-shell grid gap-8">
        <header className="panel-surface relative overflow-hidden px-6 py-7 md:px-8 md:py-8">
          <ScribbleCircle
            color="brick"
            size={300}
            variant="loop"
            className="-right-12 -top-14 opacity-15"
          />
          <div className="relative grid gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Logo width={140} />
              <Badge tone="maroon">Brand reference</Badge>
              <Badge tone="forest">{language.badge}</Badge>
            </div>
            <BrushHeadline color="brick" size="2xl" rotate={-2} as="h1">
              DuitLater design DNA.
            </BrushHeadline>
            <p className="max-w-3xl text-base text-[var(--dl-slate)] sm:text-lg">
              {language.description}
            </p>
          </div>
        </header>

        <section className="grid gap-4">
          <h2 className="zine-display text-2xl tracking-[0.04em] text-[var(--dl-ink)]">Palette</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {palette.map((swatch) => (
              <div
                key={swatch.value}
                className="flex items-stretch border-2 border-[var(--dl-ink)]"
                style={{ boxShadow: "4px 4px 0 var(--dl-ink)" }}
              >
                <div className="w-20 shrink-0" style={{ background: swatch.value }} />
                <div className="grid gap-1 p-3">
                  <p className="zine-display text-base tracking-wide">{swatch.name}</p>
                  <code className="text-xs text-[var(--dl-slate)]">{swatch.value}</code>
                  <p className="text-xs text-[var(--dl-slate)]">{swatch.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="zine-display text-2xl tracking-[0.04em] text-[var(--dl-ink)]">Type stack</h2>
          <div className="grid gap-4">
            {fonts.map((font) => (
              <Card key={font.name}>
                <CardHeader className="gap-2 border-b-2 border-[var(--dl-ink)] pb-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <CardTitle className="zine-display text-2xl">{font.name}</CardTitle>
                    <Sparkles size={18} className="text-[var(--dl-burnt)]" />
                  </div>
                  <CardDescription>{font.role}</CardDescription>
                </CardHeader>
                <CardContent className="py-5">
                  <p
                    className={
                      font.variant === "brush"
                        ? "zine-brush text-4xl"
                        : font.variant === "mono"
                          ? "data-figure text-3xl tracking-tight"
                          : "zine-display text-3xl"
                    }
                  >
                    {font.sample}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="zine-display text-2xl tracking-[0.04em] text-[var(--dl-ink)]">Principles</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {principles.map((p) => (
              <div
                key={p.title}
                className="border-2 border-[var(--dl-ink)] bg-[var(--dl-paper)] p-5"
                style={{ boxShadow: "4px 4px 0 var(--dl-ink)" }}
              >
                <p className="zine-display text-lg tracking-wide text-[var(--dl-brick)]">{p.title}</p>
                <p className="mt-2 text-sm text-[var(--dl-slate)]">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="zine-display text-2xl tracking-[0.04em] text-[var(--dl-ink)]">Component samples</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <div
              className="border-2 border-[var(--dl-ink)] bg-[var(--dl-paper)] p-5"
              style={{ boxShadow: "4px 4px 0 var(--dl-ink)" }}
            >
              <p className="zine-display text-xs uppercase tracking-[0.18em] text-[var(--dl-brick)]">Stat chip</p>
              <div className="mt-3 zine-stat">
                <div className="zine-stat-figure">RM 2,400</div>
                <div className="zine-stat-caption">Combined cap · 8 ahli</div>
              </div>
            </div>

            <div
              className="border-2 border-[var(--dl-ink)] bg-[var(--dl-paper)] p-5"
              style={{ boxShadow: "4px 4px 0 var(--dl-ink)" }}
            >
              <p className="zine-display text-xs uppercase tracking-[0.18em] text-[var(--dl-brick)]">Numbered tab</p>
              <div className="zine-tab mt-3 flex-col items-start">
                <div className="flex items-baseline gap-3">
                  <span className="zine-tab-number">1</span>
                  <span className="text-2xl">Form Pool</span>
                </div>
                <p className="text-sm font-normal normal-case opacity-90">2–8 members at NADI centre</p>
              </div>
            </div>
          </div>
        </section>

        <p className="text-xs text-[var(--dl-slate)]">
          DuitLater hybrid design language · Pitch Zine + Neo-Brutalist + SaaS · single source of truth · build-time tokens in
          <code className="ml-1">globals.css</code>.
        </p>
      </div>
    </main>
  );
}
