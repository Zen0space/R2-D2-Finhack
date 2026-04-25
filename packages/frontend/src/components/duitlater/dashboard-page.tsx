"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import {
  ArrowRight,
  CheckCircle2,
  LogOut,
  Plus,
  ShieldCheck,
  Sparkles,
  SwatchBook,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { toast } from "sonner";
import { poolComposerOpenAtom } from "@/store/pools";
import { PoolComposerModal } from "@/components/duitlater/pool-composer-modal";
import { BrushHeadline, Logo, ScribbleCircle } from "@/components/duitlater/brand/zine";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useKampungTrustQuery, usePoolsQuery } from "@/hooks/use-pools-query";
import { useSessionQuery } from "@/hooks/use-session-query";
import { authClient } from "@/lib/auth/client";
import { cn, formatCurrency } from "@/lib/utils";
import { poolNeedCategories } from "@/types/pool";

const phaseFiveChecklist = [
  "Pool yang sudah disahkan oleh NADI kini bawa catatan bayaran balik bulanan yang visible kepada semua ahli.",
  "Ahli boleh bayar kitaran semasa terus dari detail pool dan lihat baki outstanding bergerak tanpa refresh manual.",
  "Skor kepercayaan kampung kini hidup pada dashboard supaya kemajuan komuniti terasa kolektif, bukan individu semata-mata.",
] as const;

const stateTone = {
  draft: "gold",
  locked: "forest",
  suggesting: "neutral",
  voting: "neutral",
  approved: "neutral",
  active: "neutral",
  completed: "neutral",
  dissolved: "maroon",
} as const;

const stateLabel = {
  draft: "Draft",
  locked: "Locked",
  suggesting: "Suggesting",
  voting: "Voting",
  approved: "Approved",
  active: "Active",
  completed: "Completed",
  dissolved: "Dissolved",
} as const;

function getTrustTone(score: number) {
  if (score >= 85) {
    return "forest" as const;
  }

  if (score >= 70) {
    return "gold" as const;
  }

  return "maroon" as const;
}

export function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isComposerOpen, setIsComposerOpen] = useAtom(poolComposerOpenAtom);
  const { data: session, isLoading } = useSessionQuery();
  const poolsQuery = usePoolsQuery(session?.user.id ?? null);
  const trustQuery = useKampungTrustQuery(session?.user.kampung.id ?? null);

  const signOutMutation = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(["auth", "session"], null);
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      toast.success("Anda dah sign out.");
      startTransition(() => router.push("/sign-in"));
    },
    onError: () => {
      toast.error("Couldn't sign out right now.");
    },
  });

  if (isLoading) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <div className="panel-surface grid gap-4 rounded-[2rem] p-6">
            <div className="h-5 w-32 animate-pulse rounded-full bg-[color:rgba(200,148,31,0.18)]" />
            <div className="h-14 w-2/3 animate-pulse rounded-[1.5rem] bg-[color:rgba(122,46,46,0.08)]" />
            <div className="h-32 animate-pulse rounded-[1.75rem] bg-[color:rgba(224,216,200,0.8)]" />
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="gap-3">
              <Badge tone="maroon">Belum sign in</Badge>
              <CardTitle className="text-5xl">Dashboard tunggu session anda.</CardTitle>
              <CardDescription className="text-base">
                Untuk Phase 2, anda perlu daftar masuk dulu supaya sistem tahu allowance siapa yang
                akan masuk ke dalam pool.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link className={cn(buttonVariants({ variant: "primary", size: "lg" }))} href="/sign-in">
                Sign in sekarang
              </Link>
              <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href="/sign-up">
                Cipta akaun
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { user } = session;
  const pools = poolsQuery.data ?? [];
  const firstName = user.name.split(" ")[0] ?? user.name;
  const draftCount = pools.filter((pool) => pool.state === "draft").length;
  const approvedCount = pools.filter((pool) => pool.state === "approved").length;
  const activeCount = pools.filter((pool) => pool.state === "active").length;
  const completedCount = pools.filter((pool) => pool.state === "completed").length;
  const isNadiStaff = user.role === "nadi_staff";
  const highlightedPool =
    pools.find((pool) => pool.state === "active") ??
    pools.find((pool) => pool.state === "approved") ??
    pools.at(0);
  const trust = trustQuery.data;

  return (
    <>
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell grid gap-6">
          <header className="panel-surface relative overflow-hidden px-6 py-7 md:px-8 md:py-8">
            <ScribbleCircle
              color="brick"
              size={300}
              variant="loop"
              className="-right-12 -top-14 opacity-15"
            />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Logo width={130} />
                  <Badge tone="forest">Dashboard · Phase 5</Badge>
                  {isNadiStaff ? <Badge tone="maroon">NADI staff</Badge> : null}
                </div>
                <div className="grid gap-3">
                  <BrushHeadline color="brick" size="2xl" rotate={-2} as="h1">
                    Selamat datang, {firstName}.
                  </BrushHeadline>
                  <p className="max-w-3xl text-base text-[color:var(--dl-slate)] sm:text-lg">
                    {isNadiStaff
                      ? "Portal NADI masih urus penghantaran pool, sementara ahli kampung kini mula nampak catatan bayaran balik dan kesan terus pada skor kepercayaan komuniti."
                      : "Sekarang kau dah boleh bergerak dari undian ke penghantaran, kemudian pantau bayaran balik bulanan bersama skor kepercayaan kampung kau."}
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                {!isNadiStaff ? (
                  <Button className="w-full sm:w-auto" size="default" onClick={() => setIsComposerOpen(true)}>
                    <Plus aria-hidden="true" size={16} />
                    Cipta pool
                  </Button>
                ) : null}
                {isNadiStaff ? (
                  <Link
                    className={cn(buttonVariants({ variant: "primary" }), "w-full sm:w-auto")}
                    href="/nadi/dashboard"
                  >
                    <ShieldCheck aria-hidden="true" size={16} />
                    Portal NADI
                  </Link>
                ) : null}
                <Link
                  className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
                  href="/settings"
                >
                  <SwatchBook aria-hidden="true" size={16} />
                  Settings
                </Link>
                <Button
                  className="w-full sm:w-auto"
                  variant="outline"
                  size="default"
                  onClick={() => signOutMutation.mutate()}
                  disabled={signOutMutation.isPending}
                >
                  <LogOut aria-hidden="true" size={16} />
                  {signOutMutation.isPending ? "Sedang keluar..." : "Sign out"}
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <Card
                className="relative overflow-hidden border-transparent text-[var(--dl-zine-paper)] shadow-none"
                style={{
                  background: "var(--dl-zine-teal)",
                  boxShadow: "6px 6px 0 var(--dl-zine-teal-deep)",
                }}
              >
                <ScribbleCircle
                  color="paper"
                  size={260}
                  variant="loop"
                  className="-right-10 -top-12 opacity-25"
                />
                <CardHeader className="relative gap-3 border-b border-[rgba(245,240,220,0.2)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="zine-display border border-[var(--dl-zine-paper)] px-2 py-0.5 text-xs uppercase tracking-[0.18em]">
                      PayLater Saya
                    </span>
                    <ShieldCheck aria-hidden="true" size={20} />
                  </div>
                  <CardDescription className="text-[var(--dl-zine-paper)] opacity-80">
                    {isNadiStaff
                      ? "Akaun demo NADI ini masih bawa profil kampung yang sama supaya kau boleh semak penghantaran pool untuk komuniti Felda Gedangsa."
                      : "Allowance peribadi ini akan jadi sumbangan kau bila join atau cipta pool."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative grid gap-4 py-6">
                  <p className="zine-display text-5xl tracking-[-0.02em] sm:text-7xl">
                    {formatCurrency(user.individualPayLaterAllowanceCents)}
                  </p>
                  <p className="max-w-xl text-sm text-[var(--dl-zine-paper)] opacity-85 sm:text-base">
                    {isNadiStaff
                      ? `Akaun ini dipautkan ke ${user.kampung.name}. Buka portal NADI untuk tengok pool yang menunggu pengesahan penghantaran.`
                      : `Kau dari ${user.kampung.name}. Pool kini guna allowance ahli yang dikunci untuk kira share undian, transaksi, dan catatan bayaran balik.`}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="border border-[rgba(245,240,220,0.25)] bg-[rgba(31,61,56,0.6)] p-4">
                      <p className="zine-display text-xs uppercase tracking-[0.18em] text-[var(--dl-zine-paper)] opacity-80">
                        Pool draft
                      </p>
                      <p className="zine-display mt-2 text-4xl text-[var(--dl-zine-paper)]">{draftCount}</p>
                    </div>
                    <div className="border border-[rgba(245,240,220,0.25)] bg-[rgba(31,61,56,0.6)] p-4">
                      <p className="zine-display text-xs uppercase tracking-[0.18em] text-[var(--dl-zine-paper)] opacity-80">
                        Bayaran aktif
                      </p>
                      <p className="zine-display mt-2 text-4xl text-[var(--dl-zine-paper)]">{activeCount}</p>
                    </div>
                    <div className="border border-[rgba(245,240,220,0.25)] bg-[rgba(31,61,56,0.6)] p-4 sm:col-span-2">
                      <p className="zine-display text-xs uppercase tracking-[0.18em] text-[var(--dl-zine-paper)] opacity-80">
                        {isNadiStaff ? "Menunggu NADI" : "Pool selesai"}
                      </p>
                      <p className="zine-display mt-2 text-4xl text-[var(--dl-zine-paper)]">
                        {isNadiStaff ? approvedCount : completedCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="gap-3">
                <Badge tone="maroon">Apa baru</Badge>
                  <CardTitle className="text-4xl">Catatan bayaran balik dah hidup.</CardTitle>
                  <CardDescription className="text-base">
                    {isNadiStaff
                      ? "Akaun NADI masih boleh lompat terus ke portal pengesahan, sementara akaun ahli mula nampak status bayaran aktif dan trust score kampung pada permukaan utama."
                      : "Dari dashboard ini anda boleh terus buka pool aktif, semak kitaran bayaran semasa, dan tengok skor kepercayaan kampung berubah bila ahli bayar tepat pada masanya."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 text-sm text-[color:var(--dl-slate)]">
                    {isNadiStaff
                      ? "Portal NADI memaparkan pool approved untuk kampung yang sama, manakala dashboard ahli kini memegang visible record untuk fasa repayment."
                      : highlightedPool
                        ? `Pool ${highlightedPool.name} kini jadi laluan terpantas untuk sambung demo dari approval ke repayment ledger.`
                        : "Jika anda terima invite code dari ahli lain, buka terus pautan `/join/:code`. Bila penghantaran disahkan, pool aktif akan mula memaparkan kitaran bayaran secara automatik."}
                  </div>
                  {isNadiStaff ? (
                    <Link
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
                      href="/nadi/dashboard"
                    >
                      <ShieldCheck aria-hidden="true" size={18} />
                      Buka portal NADI
                    </Link>
                  ) : highlightedPool ? (
                    <Link
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
                      href={`/pools/${highlightedPool.id}`}
                    >
                      <ArrowRight aria-hidden="true" size={18} />
                      {highlightedPool.state === "active" ? "Buka pool aktif" : "Buka pool saya"}
                    </Link>
                  ) : (
                    <Button className="w-full" variant="outline" size="lg" onClick={() => setIsComposerOpen(true)}>
                      <Plus aria-hidden="true" size={18} />
                      Cipta pool pertama
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </header>

          <section className="grid gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">Pool Saya</p>
                <h2 className="mt-2 text-4xl">Pool yang anda cipta atau sertai</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsComposerOpen(true)}>
                <Plus aria-hidden="true" size={16} />
                Tambah lagi
              </Button>
            </div>

            {poolsQuery.isLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 2 }, (_, index) => (
                  <div
                    className="panel-surface h-56 animate-pulse rounded-[1.75rem] bg-[color:rgba(224,216,200,0.72)]"
                    key={`pool-skeleton-${index}`}
                  />
                ))}
              </div>
            ) : pools.length === 0 ? (
              <Card>
                <CardHeader className="gap-3">
                  <Badge tone="maroon">Masih kosong</Badge>
                  <CardTitle className="text-4xl">
                    {isNadiStaff ? "Belum ada pool untuk dipantau." : "Belum ada pool. Cipta atau sertai."}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {isNadiStaff
                      ? "Bila ada pool yang lulus undian di kampung ini, portal NADI akan mula memaparkan kad penghantaran di sini dan pada halaman khas staf."
                      : "Sebaik sahaja anda cipta pool, kad detail pool akan muncul di sini dengan target budget, invite code, dan live cap semasa."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  {isNadiStaff ? (
                    <Link className={cn(buttonVariants({ variant: "primary", size: "lg" }))} href="/nadi/dashboard">
                      <ShieldCheck aria-hidden="true" size={18} />
                      Portal NADI
                    </Link>
                  ) : (
                    <Button size="lg" onClick={() => setIsComposerOpen(true)}>
                      <Plus aria-hidden="true" size={18} />
                      Cipta pool
                    </Button>
                  )}
                  <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href="/">
                    Lihat ringkasan
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {pools.map((pool) => {
                  const categoryLabel =
                    poolNeedCategories.find((category) => category.value === pool.statedNeedCategory)?.label ??
                    "Lain-lain";

                  return (
                    <Card key={pool.id}>
                      <CardHeader className="gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge tone={stateTone[pool.state]}>{stateLabel[pool.state]}</Badge>
                          <Badge tone="neutral">{pool.kampungName}</Badge>
                          {pool.isInitiator ? <Badge tone="gold">Initiator</Badge> : null}
                        </div>
                        <div className="grid gap-2">
                          <CardTitle>{pool.name}</CardTitle>
                          <CardDescription className="text-base">
                            {categoryLabel} · invite code {pool.inviteCode}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                              Target
                            </p>
                            <p className="mt-2 text-lg font-semibold">{formatCurrency(pool.targetBudgetCents)}</p>
                          </div>
                          <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                              Ahli
                            </p>
                            <p className="mt-2 text-lg font-semibold">
                              {pool.memberCount}/{pool.memberCount + pool.remainingSlots}
                            </p>
                          </div>
                          <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                              Cap
                            </p>
                            <p className="mt-2 text-lg font-semibold">
                              {formatCurrency(pool.combinedCapCents ?? pool.currentCombinedCapCents)}
                            </p>
                          </div>
                        </div>

                        <Link
                          className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between")}
                          href={`/pools/${pool.id}`}
                        >
                          Buka detail pool
                          <ArrowRight aria-hidden="true" size={16} />
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader className="gap-3">
                <Badge tone="forest">Profil</Badge>
                <CardTitle className="text-4xl">Ringkasan ahli</CardTitle>
                <CardDescription className="text-base">
                  Identiti dan kampung ini ikut terus ke semua tindakan anda, termasuk undian pool atau pengesahan NADI.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.7)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                    Nama
                  </p>
                  <p className="mt-2 text-xl font-semibold">{user.name}</p>
                </div>
                <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/78 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                    E-mel
                  </p>
                  <p className="mt-2 text-lg">{user.email}</p>
                </div>
                <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/78 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                    Kampung
                  </p>
                  <p className="mt-2 text-lg">
                    {user.kampung.name}, {user.kampung.district}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-3">
                <Badge tone={trust ? getTrustTone(trust.score) : "gold"}>Skor kepercayaan</Badge>
                <CardTitle className="text-4xl">Kampung anda dalam fasa bayar balik</CardTitle>
                <CardDescription className="text-base">
                  Visible record kini bukan sekadar undian dan penghantaran. Bayaran balik bulanan sudah mula membentuk reputasi kampung secara kolektif.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {trust ? (
                  <div className="overflow-hidden rounded-[1.5rem] border border-transparent bg-[linear-gradient(160deg,rgba(122,46,46,0.96),rgba(200,148,31,0.94))] p-5 text-white">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
                          Skor kepercayaan kampung anda
                        </p>
                        <p className="data-figure mt-3 text-5xl font-semibold tracking-[-0.08em]">
                          {Math.round(trust.score)}
                        </p>
                      </div>
                      <Badge className="border-white/16 bg-white/10 text-white" tone="neutral">
                        {trust.labelBm}
                      </Badge>
                    </div>
                    <p className="mt-3 max-w-xl text-sm text-white/78 sm:text-base">
                      {`Skor kepercayaan kampung anda: ${Math.round(trust.score)} — ${trust.labelBm.toLowerCase()}. Bila ahli bayar mengikut kitaran, catatan ini jadi lebih kukuh untuk komuniti yang sama.`}
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[1.25rem] border border-white/14 bg-black/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                          Signal
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">{trust.signalCount}</p>
                      </div>
                      <div className="rounded-[1.25rem] border border-white/14 bg-black/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                          Completion
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">{trust.completionRatePct}%</p>
                      </div>
                      <div className="rounded-[1.25rem] border border-white/14 bg-black/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                          Pool kampung
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">{trust.poolCount}</p>
                      </div>
                    </div>
                  </div>
                ) : trustQuery.isLoading ? (
                  <div className="panel-surface h-44 animate-pulse rounded-[1.75rem] bg-[color:rgba(224,216,200,0.72)]" />
                ) : (
                  <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 text-sm text-[color:var(--dl-slate)]">
                    Skor kepercayaan kampung belum dapat dipanggil sekarang. Halaman ini akan cuba semula secara automatik.
                  </div>
                )}

                {phaseFiveChecklist.map((item) => (
                  <div
                    className="flex items-start gap-3 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/78 p-4"
                    key={item}
                  >
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:rgba(200,148,31,0.14)] text-[color:var(--dl-gold-dark)]">
                      <Sparkles aria-hidden="true" size={18} />
                    </div>
                    <p className="text-sm text-[color:var(--dl-ink)] sm:text-base">{item}</p>
                  </div>
                ))}

                <div className="flex items-center gap-3 rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4 text-sm text-[color:var(--dl-forest)]">
                  <CheckCircle2 aria-hidden="true" size={18} />
                  Phase 5 kini bermula pada permukaan ahli: pool aktif memegang visible repayment ledger, dan dashboard membawa trust score kampung sebagai nadi kolektifnya.
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {!isNadiStaff ? (
        <PoolComposerModal currentUser={user} isOpen={isComposerOpen} onClose={() => setIsComposerOpen(false)} />
      ) : null}
    </>
  );
}
