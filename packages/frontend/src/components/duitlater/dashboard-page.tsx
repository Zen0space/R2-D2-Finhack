"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  LogOut,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";
import { PoolComposerModal } from "@/components/duitlater/pool-composer-modal";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoolsQuery } from "@/hooks/use-pools-query";
import { useSessionQuery } from "@/hooks/use-session-query";
import { authClient } from "@/lib/auth/client";
import { cn, formatCurrency } from "@/lib/utils";
import { poolNeedCategories } from "@/types/pool";

const phaseTwoChecklist = [
  "Dashboard dah ada butang Cipta pool dan list pool yang user sertai.",
  "Pool detail tunjuk ahli, invite code, QR demo, pautan shareable, dan live cap semasa.",
  "Join flow melalui /join/:code dan lock flow dari initiator dah wujud sebagai frontend slice.",
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

export function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const { data: session, isLoading } = useSessionQuery();
  const poolsQuery = usePoolsQuery(session?.user.id ?? null);

  const signOutMutation = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(["auth", "session"], null);
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      toast.success("Anda dah sign out.");
      startTransition(() => router.push("/sign-in"));
    },
    onError: () => {
      toast.error("Tak dapat sign out sekarang.");
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
  const lockedCount = pools.filter((pool) => pool.state === "locked").length;

  return (
    <>
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell grid gap-6">
          <header className="panel-surface rounded-[2.25rem] px-6 py-7 md:px-8 md:py-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid gap-4">
                <div className="flex flex-wrap gap-3">
                  <Badge tone="gold">Dashboard</Badge>
                  <Badge tone="forest">Phase 2 frontend</Badge>
                </div>
                <div className="grid gap-3">
                  <h1 className="text-5xl sm:text-6xl">Selamat datang, {firstName}.</h1>
                  <p className="max-w-3xl text-base text-[color:var(--dl-slate)] sm:text-lg">
                    Sekarang anda dah boleh cipta pool, jemput ahli, dan lock combined cap terus dari
                    frontend ini. Ini sambungan terus dari allowance view Phase 1.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button className="w-full sm:w-auto" size="default" onClick={() => setIsComposerOpen(true)}>
                  <Plus aria-hidden="true" size={16} />
                  Cipta pool
                </Button>
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
              <Card className="overflow-hidden border-transparent bg-[linear-gradient(160deg,rgba(122,46,46,0.96),rgba(200,148,31,0.94))] text-white shadow-none">
                <CardHeader className="gap-3 border-b border-white/14">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge className="border-white/16 bg-white/10 text-white" tone="neutral">
                      PayLater Saya
                    </Badge>
                    <ShieldCheck aria-hidden="true" size={20} />
                  </div>
                  <CardDescription className="text-white/75">
                    Allowance peribadi ini akan jadi sumbangan anda bila join atau cipta pool.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 py-6">
                  <p className="data-figure text-5xl font-semibold tracking-[-0.08em] sm:text-6xl">
                    {formatCurrency(user.individualPayLaterAllowanceCents)}
                  </p>
                  <p className="max-w-xl text-sm text-white/78 sm:text-base">
                    Anda dari {user.kampung.name}. Pool Phase 2 guna allowance ahli sebenar untuk kira
                    live cap sebelum lock.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/14 bg-black/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                        Pool draft
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-white">{draftCount}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/14 bg-black/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                        Pool locked
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-white">{lockedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="gap-3">
                  <Badge tone="maroon">Apa baru</Badge>
                  <CardTitle className="text-4xl">Pool formation dah hidup.</CardTitle>
                  <CardDescription className="text-base">
                    Dari dashboard ini anda boleh buka modal cipta pool, masuk ke detail pool, dan
                    ikut status draft atau locked setiap pool yang anda sertai.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 text-sm text-[color:var(--dl-slate)]">
                    Jika anda terima invite code dari ahli lain, buka terus pautan `/join/:code`.
                    Auth page juga sekarang akan sambung balik ke halaman join selepas login.
                  </div>
                  <Button className="w-full" variant="outline" size="lg" onClick={() => setIsComposerOpen(true)}>
                    <Plus aria-hidden="true" size={18} />
                    Cipta pool pertama
                  </Button>
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
                  <CardTitle className="text-4xl">Belum ada pool. Cipta atau sertai.</CardTitle>
                  <CardDescription className="text-base">
                    Sebaik sahaja anda cipta pool, kad detail pool akan muncul di sini dengan target budget,
                    invite code, dan live cap semasa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button size="lg" onClick={() => setIsComposerOpen(true)}>
                    <Plus aria-hidden="true" size={18} />
                    Cipta pool
                  </Button>
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
                  Identiti ahli dan kampung ini ikut terus ke semua pool yang anda cipta atau sertai.
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
                <Badge tone="gold">Phase 2 checklist</Badge>
                <CardTitle className="text-4xl">Apa yang siap setakat ini</CardTitle>
                <CardDescription className="text-base">
                  Frontend sekarang dah bergerak ke pool formation, join, dan lock flow.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {phaseTwoChecklist.map((item) => (
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
                  Frontend-only demo ini sesuai untuk prototaip flow. Swapping ke backend sebenar nanti boleh guna surface yang sama.
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <PoolComposerModal currentUser={user} isOpen={isComposerOpen} onClose={() => setIsComposerOpen(false)} />
    </>
  );
}
