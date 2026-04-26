import Image from "next/image";
import Link from "next/link";
import {
  BrushHeadline,
  NumberedTab,
  StatChip,
  ZineSection,
} from "@/components/duitlater/brand/zine";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stats = [
  { figure: "23M+", caption: "TNG eWallet users · pool capital rail already in system" },
  { figure: "15%", caption: "Adult Malaysians remain unbanked or underbanked" },
  { figure: "2.9M", caption: "Lower-income households nationally" },
  { figure: "RM2k", caption: "Combined PayLater of six Felda neighbours · no mechanism to combine" },
] as const;

const flowSteps = [
  { n: 1, title: "Form Pool", desc: "Anyone signs up — 2–8 neighbours form a pool. No invite gate." },
  { n: 2, title: "Combine on TNG", desc: "Pool capital lives on TNG. Individual PayLater limits combine." },
  { n: 3, title: "AI Suggestions", desc: "AI advisor picks bundles from the MyKasih catalogue." },
  { n: 4, title: "Vote · TNG Pays · NADI Distributes", desc: "Majority approves. TNG charges members. NADI centre hands over the goods." },
] as const;

const stack = [
  {
    name: "TNG eWallet",
    role: "Capital rail · pool lives here",
    note: "23M users. The shared pool sits on TNG — combined PayLater limits, charged together, repaid by member.",
  },
  {
    name: "NADI",
    role: "Distribution channel",
    note: "84+ MCMC-run centres in Selangor act as the last-mile pickup point. Goods land at the village, not in a courier locker.",
  },
  {
    name: "MyKasih Foundation",
    role: "Catalogue + merchant network",
    note: "MySARA-approved item catalogue · merchant network already wired. We don't pick the goods — the catalogue does.",
  },
  {
    name: "Felda",
    role: "Communal heritage · pilot site",
    note: "The Felda model is collective by design. Pilot at Felda Gedangsa, Hulu Selangor.",
  },
] as const;

const techStack = [
  {
    category: "Frontend",
    items: ["Next.js 15", "React 19", "Tailwind v4", "shadcn/ui", "TanStack Query", "TypeScript"],
  },
  {
    category: "Backend",
    items: ["Hono", "Better Auth", "Prisma", "PostgreSQL", "Zod"],
  },
  {
    category: "AI",
    items: ["Anthropic Claude", "Alibaba Function Compute"],
  },
  {
    category: "Infra",
    items: ["Docker", "Caddy", "pnpm workspaces", "PWA / Serwist"],
  },
] as const;

const lineage = [
  { region: "Malaysia", name: "Kutu" },
  { region: "West Africa", name: "Tontine" },
  { region: "China", name: "Hui (會)" },
  { region: "Caribbean", name: "Susu" },
  { region: "India", name: "Chit fund" },
  { region: "Latin America", name: "Tanda" },
] as const;

const testBedFacts = [
  {
    label: "Underbanked target segment",
    note: "Felda smallholders sit in the B40 / lower-M40 bracket — the exact cohort where formal credit access is thinnest.",
  },
  {
    label: "Income seasonality",
    note: "Palm and rubber prices swing month-to-month. Pooled credit smooths one household's bad month against a neighbour's good one.",
  },
  {
    label: "TNG already in every pocket",
    note: "Bantuan disbursements, kedai runcit, tol. The eWallet is adopted — combined PayLater is the missing rail.",
  },
  {
    label: "NADI = trusted digital onramp",
    note: "MCMC-run centre teaches the wallet, verifies identity, hosts pickup. Banks don't reach here; NADI does.",
  },
  {
    label: "Informal kutu already runs",
    note: "Rotating-savings circles operate in cash today. We digitise behaviour the community already trusts.",
  },
] as const;

const demoBeats = [
  { label: "Try Now", note: "Open access. Just your name. No invite, no email, no bank account needed." },
  { label: "Form pool", note: "Invite 2–8 neighbours. Pool composer suggests members from the same NADI catchment." },
  { label: "AI advisor", note: "Picks bundles from MyKasih catalogue based on the pool's combined TNG limit." },
  { label: "Vote · TNG charges · NADI distributes", note: "Majority approves. TNG processes payment. NADI centre hands over the goods to members." },
] as const;

const asks = [
  {
    partner: "TNG",
    headline: "Touch ‘n Go",
    role: "Capital rail",
    ask: "PayLater sandbox API access for the pool transaction flow.",
    accent: "var(--dl-zine-paper)",
  },
  {
    partner: "MCMC",
    headline: "MCMC",
    role: "Distribution gateway",
    ask: "Formal collaboration framework with NADI Selangor — 84 centres ready as distribution channel.",
    accent: "var(--dl-zine-paper)",
  },
  {
    partner: "MyKasih",
    headline: "MyKasih Foundation",
    role: "Catalogue + merchants",
    ask: "Merchant network access + MySARA catalogue API for last-mile fulfilment.",
    accent: "var(--dl-zine-paper)",
  },
] as const;

type SectionHeading = {
  src: string;
  alt: string;
  width: number;
  height: number;
  maxW?: string;
};

function SectionHeading({ src, alt, width, height, maxW = "max-w-3xl" }: SectionHeading) {
  return (
    <div className="text-center">
      <h2 className="sr-only">{alt}</h2>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn("mx-auto h-auto w-full select-none", maxW)}
      />
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="zine-paper min-h-screen pb-24">
      {/* ─── HERO ────────────────────────────────────────────────────── */}
      <ZineSection id="hero" color="brick" className="px-4 pb-20 pt-8 md:pb-28 md:pt-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span
            className="zine-display inline-block border-2 border-[var(--dl-zine-paper)] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[var(--dl-zine-paper)] md:text-xs"
            style={{ boxShadow: "3px 3px 0 var(--dl-zine-brick-dark)" }}
          >
            TNGD FINHACK 2026 · Financial Inclusion · Team R2-D2
          </span>

          <h1 className="mt-12">
            <span className="sr-only">Sendiri tak mampu, ramai-ramai boleh!?</span>
            <Image
              src="/brand/sendiri_sendiri_png.png"
              alt="Sendiri tak mampu, ramai-ramai boleh!?"
              width={2077}
              height={502}
              priority
              className="mx-auto h-auto w-full max-w-3xl select-none"
            />
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--dl-zine-paper)] md:text-xl lg:text-2xl">
            Pool TNG PayLater with neighbours. The pool lives on TNG. AI picks
            from MyKasih. NADI hands over the goods. Open to anyone — no invite,
            no bank account.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "zine-display !bg-[var(--dl-zine-paper)] !text-[var(--dl-zine-brick)] hover:!bg-[var(--dl-zine-paper-warm)]",
              )}
              style={{ boxShadow: "5px 5px 0 var(--dl-zine-brick-dark)" }}
            >
              Try Now
            </Link>
            <InstallAppButton />
          </div>
        </div>
      </ZineSection>

      {/* ─── THE GAP ─────────────────────────────────────────────────── */}
      <ZineSection id="gap" color="forest" className="px-4 py-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <SectionHeading
            src="/brand/the_gap.png"
            alt="The Gap"
            width={1015}
            height={338}
            maxW="max-w-xl"
          />

          <Image
            src="/brand/rm300.png"
            alt="RM300 doesn't buy a sewing machine"
            width={1199}
            height={640}
            className="mt-12 h-auto w-full max-w-md select-none"
          />

          <Image
            src="/brand/mesin_jahit_mewah.png.webp"
            alt="Sewing machine — equipment a single household can't afford alone"
            width={1714}
            height={1412}
            className="mt-10 h-auto w-full max-w-sm select-none drop-shadow-[8px_8px_0_var(--dl-forest-deep)]"
          />

          <p className="mt-8 zine-brush zine-brush-cream text-3xl leading-tight md:text-4xl">
            The platform is missing.
          </p>

          <div className="mt-14 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatChip key={stat.figure} figure={stat.figure} caption={stat.caption} />
            ))}
          </div>
        </div>
      </ZineSection>

      {/* ─── THE SOLUTION ────────────────────────────────────────────── */}
      <ZineSection id="solution" color="burnt" className="px-4 py-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <SectionHeading
            src="/brand/the_solution.png"
            alt="The Solution"
            width={2775}
            height={556}
            maxW="max-w-4xl"
          />

          <p className="zine-display mt-10 max-w-3xl text-sm uppercase tracking-[0.18em] text-[var(--dl-zine-paper)] opacity-90 md:text-base">
            Three real Malaysian institutions. One product. Zero new welfare programmes invented.
          </p>

          <Image
            src="/brand/pool_credit.png"
            alt="Pool credit illustration — combined TNG PayLater limits living on TNG"
            width={616}
            height={312}
            className="mt-12 h-auto w-full max-w-md select-none drop-shadow-[6px_6px_0_var(--dl-brick-dark)]"
          />

          <div className="mt-14 grid w-full gap-6 md:grid-cols-2 md:gap-8">
            {flowSteps.map((step) => (
              <NumberedTab
                key={step.n}
                number={step.n}
                title={step.title}
                className="!flex"
              >
                {step.desc}
              </NumberedTab>
            ))}
          </div>
        </div>
      </ZineSection>

      {/* ─── THE STACK ───────────────────────────────────────────────── */}
      <ZineSection id="stack" color="paper" className="px-4 py-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <SectionHeading
            src="/brand/the_stack.png"
            alt="The Stack"
            width={1662}
            height={469}
            maxW="max-w-2xl"
          />

          <p className="mt-8 max-w-3xl text-base text-[var(--dl-slate)] md:text-lg">
            We didn&rsquo;t invent the rails. We connected them — capital on TNG, distribution at NADI, catalogue from MyKasih.
          </p>

          <p className="zine-display mt-12 text-[11px] uppercase tracking-[0.24em] text-[var(--dl-zine-brick)]">
            Institutional rails
          </p>
          <div className="mt-6 grid w-full gap-5 md:grid-cols-2">
            {stack.map((item) => (
              <div
                key={item.name}
                className="zine-stat"
                style={{ borderLeftColor: "var(--dl-zine-brick)" }}
              >
                <p className="zine-display text-2xl tracking-wide text-[var(--dl-zine-ink)]">
                  {item.name}
                </p>
                <p className="zine-display text-xs uppercase tracking-[0.2em] text-[var(--dl-zine-brick)]">
                  {item.role}
                </p>
                <p className="mt-2 text-sm text-[var(--dl-slate)]">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t-2 border-dashed border-[var(--dl-zine-ink)]/25 pt-10">
            <p className="zine-display text-center text-[11px] uppercase tracking-[0.24em] text-[var(--dl-zine-brick)]">
              Tech stack
            </p>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--dl-slate)]">
              Built in two days at FINHACK 2026 — type-safe end to end, PWA-ready, open source.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {techStack.map((group) => (
                <div key={group.category}>
                  <p className="zine-display text-[10px] uppercase tracking-[0.22em] text-[var(--dl-zine-ink)] opacity-70">
                    {group.category}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {group.items.map((tech) => (
                      <li
                        key={tech}
                        className="zine-display border-2 border-[var(--dl-zine-ink)] bg-[var(--dl-paper)] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-[var(--dl-zine-ink)]"
                        style={{ boxShadow: "2px 2px 0 var(--dl-zine-ink)" }}
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ZineSection>

      {/* ─── THE LINEAGE ─────────────────────────────────────────────── */}
      <ZineSection id="lineage" color="teal" className="px-4 py-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <SectionHeading
            src="/brand/the_lineage.png"
            alt="The Lineage"
            width={2164}
            height={456}
            maxW="max-w-3xl"
          />

          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-[var(--dl-zine-paper)] md:text-xl">
            Communities have pooled, rotated, and built — for centuries, across continents.
            Same instinct, different names.
          </p>

          <div className="mt-12 grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
            {lineage.map((item) => (
              <div
                key={item.name}
                className="border-2 border-[var(--dl-zine-paper)] bg-[rgba(245,240,220,0.05)] p-4 text-center"
                style={{ boxShadow: "4px 4px 0 var(--dl-teal-deep)" }}
              >
                <p className="zine-display text-xs uppercase tracking-[0.22em] text-[var(--dl-zine-paper)] opacity-70">
                  {item.region}
                </p>
                <p className="mt-2 zine-display text-2xl tracking-wide text-[var(--dl-zine-paper)] md:text-3xl">
                  {item.name}
                </p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-12 max-w-xl text-center zine-brush zine-brush-cream text-3xl leading-tight md:text-4xl">
            We just gave it TNG rails.
          </p>
        </div>
      </ZineSection>

      {/* ─── THE TEST BED ────────────────────────────────────────────── */}
      <ZineSection id="test-bed" color="paper" className="px-4 py-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <SectionHeading
            src="/brand/the_test_bed.png"
            alt="The Test Bed"
            width={1797}
            height={368}
            maxW="max-w-2xl"
          />

          <p className="zine-display mt-8 text-2xl tracking-[0.06em] text-[var(--dl-zine-brick)] md:text-3xl">
            Felda Gedangsa
          </p>
          <BrushHeadline color="brick" size="lg" rotate={0} as="p" className="mt-2">
            Why here?
          </BrushHeadline>

          <figure
            className="relative mt-12 w-full max-w-3xl overflow-hidden border-2 border-[var(--dl-zine-ink)] bg-[var(--dl-paper-warm)] p-3"
            style={{ boxShadow: "6px 6px 0 var(--dl-zine-ink)" }}
          >
            <Image
              src="/brand/map_of_selangor.png"
              alt="Map of Selangor with NADI centres across nine districts; Felda Gedangsa pilot site highlighted in Hulu Selangor"
              width={2076}
              height={1322}
              className="h-auto w-full select-none"
            />
            <figcaption className="zine-display mt-3 flex flex-wrap items-baseline justify-between gap-3 border-t-2 border-dashed border-[var(--dl-zine-ink)]/30 pt-3 text-xs uppercase tracking-[0.18em] text-[var(--dl-slate)]">
              <span>Selangor · 9 districts</span>
              <span>84+ NADI distribution points</span>
            </figcaption>
          </figure>

          <p className="mt-6 max-w-2xl text-base text-[var(--dl-slate)] md:text-lg">
            The kampung exists. The rails exist. Kutu already runs.
            <br className="hidden md:block" />
            <span className="font-semibold text-[var(--dl-zine-brick)]"> We connect — we don&rsquo;t invent.</span>
          </p>

          <ul className="mt-12 grid w-full gap-4 text-left sm:grid-cols-2">
            {testBedFacts.map((fact) => (
              <li
                key={fact.label}
                className="zine-stat"
                style={{ borderLeftColor: "var(--dl-zine-forest)" }}
              >
                <p className="font-bold text-[var(--dl-zine-ink)]">{fact.label}</p>
                <p className="mt-1 text-sm text-[var(--dl-slate)]">{fact.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </ZineSection>

      {/* ─── THE DEMO ────────────────────────────────────────────────── */}
      <ZineSection id="demo" color="burnt" className="px-4 py-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <SectionHeading
            src="/brand/the_demo.png"
            alt="The Demo"
            width={1576}
            height={657}
            maxW="max-w-2xl"
          />

          <p className="mt-8 max-w-2xl text-base text-[var(--dl-zine-paper)] opacity-90 md:text-lg">
            Live and shipping at FINHACK 2026. Open sign-up. Form a pool, vote, buy.
          </p>

          <div className="mt-12 grid w-full gap-5 text-left md:grid-cols-2">
            {demoBeats.map((beat, i) => (
              <div
                key={beat.label}
                className="border-2 border-[var(--dl-zine-paper)] bg-[rgba(245,240,220,0.08)] p-5"
                style={{ boxShadow: "5px 5px 0 var(--dl-brick-dark)" }}
              >
                <p className="zine-display text-xs uppercase tracking-[0.22em] text-[var(--dl-zine-paper)] opacity-70">
                  Step {i + 1}
                </p>
                <p className="mt-1 zine-display text-2xl tracking-wide text-[var(--dl-zine-paper)]">
                  {beat.label}
                </p>
                <p className="mt-2 text-sm text-[var(--dl-zine-paper)] opacity-90">{beat.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "zine-display !bg-[var(--dl-zine-paper)] !text-[var(--dl-zine-burnt)] hover:!bg-[var(--dl-zine-paper-warm)]",
              )}
              style={{ boxShadow: "5px 5px 0 var(--dl-brick-dark)" }}
            >
              Try Now
            </Link>
          </div>
        </div>
      </ZineSection>

      {/* ─── THE ASK ─────────────────────────────────────────────────── */}
      <ZineSection id="ask" color="brick" className="px-4 py-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <SectionHeading
            src="/brand/the_ask.png"
            alt="The Ask · What we need"
            width={1623}
            height={576}
            maxW="max-w-3xl"
          />

          <p className="zine-display mt-8 max-w-3xl text-sm uppercase tracking-[0.18em] text-[var(--dl-zine-paper)] opacity-90 md:text-base">
            Three partners. Three concrete asks to take this from pilot to production.
          </p>

          <div className="mt-14 grid w-full gap-6 text-left md:grid-cols-3">
            {asks.map((item) => (
              <div
                key={item.partner}
                className="border-2 border-[var(--dl-zine-paper)] bg-[rgba(245,240,220,0.08)] p-6"
                style={{ boxShadow: "6px 6px 0 var(--dl-zine-brick-dark)" }}
              >
                <p className="zine-display text-xs uppercase tracking-[0.24em] text-[var(--dl-zine-paper)] opacity-70">
                  {item.partner}
                </p>
                <p
                  className="mt-2 zine-display text-2xl tracking-wide text-[var(--dl-zine-paper)] md:text-3xl"
                  style={{ color: item.accent }}
                >
                  {item.headline}
                </p>
                <p className="mt-1 zine-display text-[11px] uppercase tracking-[0.2em] text-[var(--dl-zine-paper)] opacity-70">
                  {item.role}
                </p>
                <div className="my-4 h-[2px] w-12 bg-[var(--dl-zine-paper)] opacity-40" />
                <p className="text-sm text-[var(--dl-zine-paper)] opacity-95 md:text-base">
                  {item.ask}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "zine-display !bg-[var(--dl-zine-paper)] !text-[var(--dl-zine-brick)] hover:!bg-[var(--dl-zine-paper-warm)]",
              )}
              style={{ boxShadow: "5px 5px 0 var(--dl-zine-brick-dark)" }}
            >
              Try Now
            </Link>
          </div>
        </div>
      </ZineSection>
    </main>
  );
}
