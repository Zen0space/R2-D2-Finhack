import { ArrowRight, Landmark, Lock, Share2, UsersRound } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

const phaseHighlights = [
  {
    title: "Cipta pool dari dashboard",
    description: "Member boleh buka modal, isi nama pool, kategori, need text, dan target budget terus dari dashboard.",
    icon: UsersRound,
  },
  {
    title: "Jemput melalui kod & link",
    description: "Setiap pool terus ada invite code, QR demo, dan pautan shareable untuk flow join ahli lain.",
    icon: Share2,
  },
  {
    title: "Lock combined cap",
    description: "Initiator boleh lock roster dan bekukan combined cap sebelum masuk ke cadangan barang Phase 3.",
    icon: Lock,
  },
] as const;

const quickStats = [
  { label: "Ahli pool", value: "2-8" },
  { label: "Fasa ini", value: "Pool + invite + lock" },
  { label: "Facilitator", value: "NADI" },
] as const;

export function LandingPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:py-10">
      <div className="page-shell grid gap-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-[color:rgba(122,46,46,0.12)] bg-[color:rgba(248,244,236,0.72)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="section-kicker">DuitLater</p>
            <p className="mt-2 text-sm text-[color:var(--dl-slate)]">
              Sendiri tak mampu, ramai-ramai boleh.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className={cn(buttonVariants({ variant: "outline" }))} href="/sign-in">
              Sign in
            </Link>
            <Link className={cn(buttonVariants({ variant: "primary" }))} href="/sign-up">
              Mula sekarang
            </Link>
          </div>
        </header>

        <section className="panel-surface overflow-hidden rounded-[2.25rem]">
          <div className="grid gap-10 px-6 py-8 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-10">
            <div className="editorial-copy grid gap-6">
              <Badge tone="gold">Phase 2 frontend preview</Badge>
              <div className="grid gap-4">
                <h1 className="max-w-4xl text-5xl sm:text-6xl lg:text-7xl">
                  Cipta pool, jemput ahli, kemudian lock combined cap.
                </h1>
                <p className="max-w-2xl text-base text-[color:var(--dl-slate)] sm:text-lg">
                  DuitLater dah bergerak masuk Phase 2 frontend: member boleh buka pool sendiri,
                  kongsi invite code, dan tengok cap semasa naik bila ahli lain join sebelum lock.
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

              <div className="grid gap-3 sm:grid-cols-3">
                {quickStats.map((stat) => (
                  <div
                    className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/78 px-4 py-4"
                    key={stat.label}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[color:var(--dl-ink)]">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="overflow-hidden border-[color:rgba(122,46,46,0.12)] bg-[linear-gradient(160deg,rgba(122,46,46,0.92),rgba(200,148,31,0.94))] text-white">
              <CardHeader className="gap-4 border-b border-white/14">
                <div className="flex items-center justify-between gap-4">
                  <Badge className="border-white/16 bg-white/10 text-white" tone="neutral">
                    Dashboard preview
                  </Badge>
                  <UsersRound aria-hidden="true" size={22} />
                </div>
                <div className="grid gap-2">
                  <CardTitle className="text-4xl text-white">Pool Gedangsa Jahit</CardTitle>
                  <CardDescription className="text-white/78">
                    Phase 2 member flow lepas initiator cipta pool dan mula jemput ahli.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 py-6">
                <div className="rounded-[1.75rem] border border-white/18 bg-black/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                    Nurul Aisyah · Felda Gedangsa · Draft
                  </p>
                  <p className="data-figure mt-3 text-5xl font-semibold tracking-[-0.08em]">
                    {formatCurrency(75_000)}
                  </p>
                  <p className="mt-3 max-w-sm text-sm text-white/78">
                    Combined cap semasa naik bila ahli lain join. Lepas initiator lock, angka ini dibekukan.
                  </p>
                </div>

                <div className="grid gap-4 rounded-[1.75rem] border border-white/16 bg-white/10 p-5">
                  <div className="flex items-center gap-3 text-white">
                    <Landmark aria-hidden="true" size={18} />
                    <strong className="text-base font-semibold">Invite code: K6P8T2QW</strong>
                  </div>
                  <p className="text-sm text-white/78">
                    Ahli lain boleh buka halaman join, sertai pool, dan initiator terus nampak roster ahli di detail page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {phaseHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title}>
                <CardHeader className="gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:rgba(200,148,31,0.14)] text-[color:var(--dl-gold-dark)]">
                    <Icon aria-hidden="true" size={22} />
                  </div>
                  <div className="grid gap-2">
                    <CardTitle className="text-[2rem]">{item.title}</CardTitle>
                    <CardDescription className="text-base">{item.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}
