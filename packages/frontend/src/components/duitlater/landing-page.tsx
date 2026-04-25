import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  FileText,
  HandCoins,
  House,
  KeyRound,
  Landmark,
  LockKeyhole,
  Scissors,
  Send,
  SwatchBook,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";

const heroSignals = [
  { icon: UsersRound, label: "2-8", caption: "Ahli pool" },
  { icon: KeyRound, label: "Kod", caption: "Jemputan" },
  { icon: LockKeyhole, label: "Lock", caption: "Cap akhir" },
] as const;

const poolFacts = [
  { icon: UserRound, label: "Initiator", value: "Nurul" },
  { icon: House, label: "Kampung", value: "Gedangsa" },
  { icon: Scissors, label: "Kategori", value: "Jahit" },
  { icon: UsersRound, label: "Kuota", value: "3 / 8" },
] as const;

const rosterPreview = [
  { name: "Nurul Aisyah", state: "Initiator" },
  { name: "Farah Hani", state: "Join" },
  { name: "Auni Sofia", state: "Menunggu" },
] as const;

const memberJourney = [
  {
    icon: FileText,
    title: "Cipta pool",
    description: "Nama, need, bajet.",
  },
  {
    icon: Send,
    title: "Jemput ahli",
    description: "Kod atau pautan.",
  },
  {
    icon: LockKeyhole,
    title: "Lock cap",
    description: "Roster dibekukan.",
  },
] as const;

const supportNotes = [
  {
    icon: Landmark,
    title: "Mudah dipandu di NADI",
    description: "Susun atur ringkas.",
  },
  {
    icon: Wallet,
    title: "Cap semasa jelas",
    description: "Angka utama di depan.",
  },
  {
    icon: HandCoins,
    title: "Sedia ke Phase 3",
    description: "Terus ke cadangan barang.",
  },
] as const;

function IconTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[color:rgba(224,216,200,0.9)] bg-white/72 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:rgba(122,46,46,0.12)] bg-[color:rgba(248,244,236,0.9)] text-[color:var(--dl-maroon)]">
        <Icon aria-hidden="true" size={18} />
      </div>
      <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dl-slate)]">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-[color:var(--dl-ink)]">{value}</p>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="landing-geist px-4 py-6 sm:px-6 lg:py-10">
      <div className="page-shell grid gap-6">
        <header className="rounded-[2rem] border border-[color:rgba(122,46,46,0.12)] bg-[color:rgba(248,244,236,0.9)] px-5 py-4 shadow-[0_16px_32px_rgba(73,53,19,0.06)] sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-2">
              <p className="section-kicker">DuitLater</p>
              <p className="max-w-xl text-sm text-[color:var(--dl-slate)]">
                Pool belian bersama untuk keluarga dan komuniti kecil.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className={cn(buttonVariants({ variant: "ghost" }))} href="/settings">
                <SwatchBook aria-hidden="true" size={16} />
                Settings
              </Link>
              <Link className={cn(buttonVariants({ variant: "outline" }))} href="/sign-in">
                Sign in
              </Link>
              <Link className={cn(buttonVariants({ variant: "primary" }))} href="/sign-up">
                Mula sekarang
              </Link>
            </div>
          </div>
        </header>

        <section className="rounded-[2.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(249,246,240,0.94)] px-6 py-7 shadow-[0_22px_44px_rgba(73,53,19,0.08)] md:px-8 md:py-8 lg:px-10 lg:py-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.92fr)] lg:items-start">
            <div className="grid gap-7">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="maroon">Phase 2 frontend</Badge>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--dl-slate)]">
                  Pool formation
                </p>
              </div>

              <div className="grid gap-4">
                <h1 className="max-w-4xl text-[clamp(3.1rem,8vw,6.2rem)] leading-[0.94]">
                  Bina pool. Jemput ahli. Kunci cap.
                </h1>
                <p className="max-w-xl text-base text-[color:var(--dl-slate)] sm:text-lg">
                  Kurang cakap, lebih jelas. Semua perkara penting duduk depan mata.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className={cn(buttonVariants({ variant: "primary", size: "lg" }))} href="/sign-up">
                  Cipta akaun
                  <ArrowRight aria-hidden="true" size={18} />
                </Link>
                <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href="/sign-in">
                  Saya dah ada akaun
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {heroSignals.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      className="rounded-[1.5rem] border border-[color:rgba(122,46,46,0.12)] bg-[color:rgba(255,255,255,0.76)] p-4 shadow-[0_12px_24px_rgba(73,53,19,0.05)]"
                      key={item.caption}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:rgba(122,46,46,0.14)] bg-[color:rgba(248,244,236,0.92)] text-[color:var(--dl-maroon)]">
                        <Icon aria-hidden="true" size={19} />
                      </div>
                      <p className="mt-4 text-2xl font-semibold text-[color:var(--dl-ink)]">{item.label}</p>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--dl-slate)]">
                        {item.caption}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-[2rem] border border-[color:rgba(122,46,46,0.15)] bg-[color:rgba(255,252,245,0.95)] p-6 shadow-[0_18px_36px_rgba(73,53,19,0.08)]">
              <div className="flex items-start justify-between gap-4 border-b border-[color:rgba(122,46,46,0.12)] pb-4">
                <div className="grid gap-2">
                  <p className="section-kicker">Register pool</p>
                  <h2 className="text-4xl sm:text-[2.5rem]">Gedangsa Jahit</h2>
                </div>
                <Badge tone="gold">Draft</Badge>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {poolFacts.map((item) => (
                  <IconTile icon={item.icon} key={item.label} label={item.label} value={item.value} />
                ))}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-[color:rgba(200,148,31,0.22)] bg-[color:rgba(248,244,236,0.85)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:rgba(200,148,31,0.26)] bg-white/70 text-[color:var(--dl-gold-dark)]">
                    <Wallet aria-hidden="true" size={18} />
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dl-gold-dark)]">
                      Combined cap
                    </p>
                    <p className="data-figure text-3xl font-semibold tracking-[-0.08em] text-[color:var(--dl-ink)]">
                      {formatCurrency(75_000)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 border-t border-[color:rgba(122,46,46,0.12)] pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:rgba(122,46,46,0.12)] bg-[color:rgba(248,244,236,0.92)] text-[color:var(--dl-maroon)]">
                      <KeyRound aria-hidden="true" size={18} />
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dl-slate)]">
                        Invite code
                      </p>
                      <strong className="data-figure text-base tracking-[0.24em] text-[color:var(--dl-maroon)]">
                        K6P8T2QW
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {rosterPreview.map((member) => (
                    <div
                      className="flex items-center justify-between gap-4 rounded-[1.15rem] border border-[color:rgba(224,216,200,0.85)] bg-white/72 px-4 py-3"
                      key={member.name}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:rgba(122,46,46,0.12)] bg-[color:rgba(248,244,236,0.92)] text-[color:var(--dl-maroon)]">
                          <UsersRound aria-hidden="true" size={16} />
                        </div>
                        <p className="text-sm font-medium text-[color:var(--dl-ink)]">{member.name}</p>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                        {member.state}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {memberJourney.map((item) => {
            const Icon = item.icon;

            return (
              <div
                className="rounded-[1.9rem] border border-[color:rgba(122,46,46,0.1)] bg-[color:rgba(255,255,255,0.76)] p-6 shadow-[0_14px_28px_rgba(73,53,19,0.05)]"
                key={item.title}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:rgba(122,46,46,0.14)] bg-[color:rgba(248,244,236,0.92)] text-[color:var(--dl-maroon)]">
                  <Icon aria-hidden="true" size={20} />
                </div>
                <h2 className="mt-5 text-3xl sm:text-[2.25rem]">{item.title}</h2>
                <p className="mt-2 text-sm text-[color:var(--dl-slate)] sm:text-base">{item.description}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {supportNotes.map((item) => {
            const Icon = item.icon;

            return (
              <div
                className="rounded-[1.9rem] border border-[color:rgba(122,46,46,0.1)] bg-[color:rgba(248,244,236,0.8)] p-6 shadow-[0_14px_28px_rgba(73,53,19,0.05)]"
                key={item.title}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[color:rgba(122,46,46,0.14)] bg-white/75 text-[color:var(--dl-maroon)]">
                    <Icon aria-hidden="true" size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-[2rem]">{item.title}</h2>
                    <p className="mt-1 text-sm text-[color:var(--dl-slate)]">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
