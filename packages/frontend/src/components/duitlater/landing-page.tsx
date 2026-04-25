import Link from "next/link";
import {
  BrushHeadline,
  Logo,
  NumberedTab,
  ScribbleCircle,
  StatChip,
  TornCard,
  ZineSection,
} from "@/components/duitlater/brand/zine";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stats = [
  { figure: "23M+", caption: "TNG eWallet users · rails already in system" },
  { figure: "15%", caption: "Adult Malaysians remain unbanked / underbanked" },
  { figure: "2.9M", caption: "B40 households nationally" },
  { figure: "RM2k", caption: "Combined PayLater of six Felda neighbours · no mechanism to combine" },
] as const;

const flowSteps = [
  { n: 1, title: "Form Pool", desc: "2–8 members at NADI centre" },
  { n: 2, title: "Combine PayLater", desc: "Sum of individual TNG limits" },
  { n: 3, title: "AI Suggestions", desc: "AI in BM picks from MyKasih catalogue" },
  { n: 4, title: "Pool Votes & Buys", desc: "Majority approves; TNG processes; NADI confirms delivery" },
] as const;

const testBedFacts = [
  { label: "Felda Settlement", note: "Primarily oil-palm + rubber smallholders" },
  { label: "Communal management tradition", note: "Felda model is collective by design" },
  { label: "MCMC-run NADI centre", note: "Already serves the kampung — digital training, light banking, courier" },
  { label: "B40 concentrated", note: "Felda smallholders predominantly in B40 income bracket" },
  { label: "1.5h drive from FINHACK venue", note: "Site visit feasibility for Day 2 follow-up" },
] as const;

export function LandingPage() {
  return (
    <main className="zine-paper min-h-screen pb-24">
      {/* ─── HERO — slide 1 DNA ──────────────────────────────────────── */}
      <ZineSection color="brick" className="px-4 pb-24 pt-16 md:pb-28 md:pt-24">
        <div className="page-shell relative">
          <ScribbleCircle
            color="paper"
            size={520}
            variant="loop"
            className="left-1/2 top-1/2 -translate-x-[55%] -translate-y-[55%] opacity-20"
          />
          <ScribbleCircle
            color="paper"
            size={420}
            variant="double"
            className="left-1/2 top-1/2 -translate-x-[40%] -translate-y-[35%] opacity-15"
          />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <span
              className="zine-display inline-block border-2 border-[var(--dl-zine-paper)] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[var(--dl-zine-paper)] md:text-xs"
              style={{ boxShadow: "3px 3px 0 var(--dl-zine-brick-dark)" }}
            >
              TNG FINHACK 2026 · Financial Inclusion
            </span>

            <h1 className="mt-8 zine-display text-[var(--dl-zine-paper)] text-5xl leading-[0.9] tracking-tight md:text-7xl lg:text-8xl">
              Sendiri tak mampu,
            </h1>
            <BrushHeadline
              color="cream"
              size="2xl"
              rotate={-2}
              className="mt-4 block leading-[0.85] md:mt-6"
            >
              ramai-ramai boleh!?
            </BrushHeadline>

            <p className="mx-auto mt-10 max-w-xl text-base text-[var(--dl-zine-paper)] opacity-90 md:text-lg">
              Pool kelompok B40 · combine TNG PayLater · AI Penasihat picks from MyKasih ·
              kampung trust score grows. Built on real Malaysian rails — TNG · NADI · MyKasih.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "zine-display !bg-[var(--dl-zine-paper)] !text-[var(--dl-zine-brick)] hover:!bg-[var(--dl-zine-paper-warm)]",
                )}
                style={{ boxShadow: "5px 5px 0 var(--dl-zine-brick-dark)" }}
              >
                Mula pool sekarang
              </Link>
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "zine-display !border-[var(--dl-zine-paper)] !text-[var(--dl-zine-paper)] hover:!bg-[rgba(245,240,220,0.12)]",
                )}
              >
                Daftar masuk
              </Link>
              <InstallAppButton />
            </div>
          </div>
        </div>
      </ZineSection>

      {/* ─── PROBLEM — slide 2 DNA ──────────────────────────────────── */}
      <ZineSection color="forest" className="px-4 py-20">
        <div className="page-shell relative grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="relative">
            <h2 className="zine-display text-5xl text-[var(--dl-zine-paper)] md:text-7xl">
              RM300 doesn&rsquo;t
              <br />
              buy a sewing
              <br />
              machine
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {stats.map((stat, i) => (
                <StatChip
                  key={stat.figure}
                  figure={stat.figure}
                  caption={stat.caption}
                  rotate={i % 2 === 0 ? -1.5 : 1.5}
                />
              ))}
            </div>
          </div>

          <div className="relative flex flex-col items-end gap-6">
            <div className="relative ml-auto">
              <BrushHeadline color="brick" size="2xl" rotate={-6} as="div">
                The Gap
              </BrushHeadline>
              <ScribbleCircle
                color="brick"
                size={260}
                variant="loop"
                className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
            <p className="zine-brush zine-brush-cream text-2xl leading-tight md:text-3xl">
              The Platform is Missing.
            </p>
          </div>
        </div>
      </ZineSection>

      {/* ─── SOLUTION — slide 3 DNA ─────────────────────────────────── */}
      <ZineSection color="burnt" className="px-4 py-20">
        <div className="page-shell relative">
          <p className="zine-display max-w-3xl text-sm uppercase tracking-[0.18em] text-[var(--dl-zine-paper)] opacity-90 md:text-base">
            TNG (PayLater Rail) · NADI (Community Facilitator · 84 in Selangor) ·
            MyKasih (MySARA item catalogue + merchant network) · B40 households (the pool).
            <br />
            Four real Malaysian institutions. One product. Zero new welfare programmes invented.
          </p>

          <div className="relative mt-14 grid gap-6 md:grid-cols-2 md:gap-8">
            {flowSteps.map((step, i) => (
              <NumberedTab
                key={step.n}
                number={step.n}
                title={step.title}
                rotate={i % 2 === 0 ? -1 : 1}
                className="!flex"
              >
                {step.desc}
              </NumberedTab>
            ))}
          </div>

          <div className="mt-16 flex items-end justify-center gap-6">
            <BrushHeadline color="cream" size="3xl" rotate={-3} as="div">
              The Solution!
            </BrushHeadline>
          </div>
        </div>
      </ZineSection>

      {/* ─── TEST BED — slide 4 DNA ─────────────────────────────────── */}
      <ZineSection color="paper" className="px-4 py-20">
        <div className="page-shell relative grid gap-10 md:grid-cols-[1fr_1fr] md:items-start">
          <div>
            <p className="zine-display text-2xl tracking-[0.06em] text-[var(--dl-zine-brick)] md:text-3xl">
              Felda Gedangsa
            </p>
            <BrushHeadline color="brick" size="2xl" rotate={-3} as="h2" className="mt-2">
              The Test Bed
            </BrushHeadline>

            <p className="mt-8 zine-brush zine-brush-forest text-3xl md:text-4xl">Why NADI Felda Gedangsa?</p>

            <ul className="mt-6 space-y-4">
              {testBedFacts.map((fact) => (
                <li key={fact.label} className="zine-stat" style={{ borderLeftColor: "var(--dl-zine-forest)" }}>
                  <p className="font-bold text-[var(--dl-zine-ink)]">{fact.label}</p>
                  <p className="mt-1 text-sm text-[var(--dl-slate)]">{fact.note}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex flex-col items-center gap-6">
            <TornCard rotate="r" bg="cream" className="max-w-md">
              <div className="flex flex-col items-center gap-4">
                <div className="zine-display text-xs uppercase tracking-[0.32em] text-[var(--dl-zine-brick)]">
                  Selangor · Hulu Selangor
                </div>
                <p className="text-center text-sm text-[var(--dl-slate)]">
                  Real institutions. Real settlement. Real B40 household pool dynamics —
                  not synthetic.
                </p>
              </div>
            </TornCard>
          </div>
        </div>
      </ZineSection>

      {/* ─── BOTTOM CTA ─────────────────────────────────────────────── */}
      <ZineSection color="teal" className="px-4 py-20">
        <div className="page-shell relative text-center">
          <Logo width={260} className="mx-auto" />
          <BrushHeadline color="cream" size="2xl" rotate={-2} as="h2" className="mt-8">
            Jom mula pool kau.
          </BrushHeadline>
          <p className="mx-auto mt-6 max-w-xl text-base text-[var(--dl-zine-paper)] opacity-85 md:text-lg">
            Daftar dengan TNG eWallet kau. Jemput jiran. Combine PayLater. Beli barang yang
            seorang sahaja tak mampu.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "zine-display !bg-[var(--dl-zine-paper)] !text-[var(--dl-zine-teal)] hover:!bg-[var(--dl-zine-paper-warm)]",
              )}
              style={{ boxShadow: "5px 5px 0 var(--dl-zine-teal-deep)" }}
            >
              Daftar sekarang
            </Link>
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "zine-display !border-[var(--dl-zine-paper)] !text-[var(--dl-zine-paper)] hover:!bg-[rgba(245,240,220,0.12)]",
              )}
            >
              Daftar masuk
            </Link>
          </div>
        </div>
      </ZineSection>
    </main>
  );
}
