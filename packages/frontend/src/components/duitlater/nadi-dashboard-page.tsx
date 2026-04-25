"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, RefreshCw, ShieldCheck, Sparkles, TriangleAlert, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { formatErrorMessage } from "@/lib/api/errors";
import { useNadiPoolsQuery, useNadiWeeklySummaryQuery } from "@/hooks/use-pools-query";
import { useSessionQuery } from "@/hooks/use-session-query";
import { poolsClient } from "@/lib/pools/client";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Belum direkod";
  }

  return new Intl.DateTimeFormat("ms-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ms-MY", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function NadiDashboardPage() {
  const queryClient = useQueryClient();
  const [isRefreshCoolingDown, setIsRefreshCoolingDown] = useState(false);
  const { data: session, isLoading: isSessionLoading } = useSessionQuery();
  const poolsQuery = useNadiPoolsQuery(session?.user ?? null);
  const summaryQuery = useNadiWeeklySummaryQuery(session?.user ?? null);

  const confirmMutation = useMutation({
    mutationFn: (poolId: string) => {
      if (!session) {
        throw new Error("Session expired — sign in again to continue.");
      }

      return poolsClient.confirmDelivery(poolId, session.user);
    },
    onSuccess: (updatedPool) => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      queryClient.setQueryData(["pools", "detail", updatedPool.id], updatedPool);
      toast.success("Penghantaran telah disahkan. Pool kini bergerak ke state active.");
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Couldn't confirm delivery right now."));
    },
  });

  if (isSessionLoading) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <div className="panel-surface grid gap-4 rounded-[2rem] p-6">
            <div className="h-5 w-32 animate-pulse rounded-full bg-[color:rgba(200,148,31,0.18)]" />
            <div className="h-14 w-2/3 animate-pulse rounded-[1.5rem] bg-[color:rgba(122,46,46,0.08)]" />
            <div className="h-40 animate-pulse rounded-[1.75rem] bg-[color:rgba(224,216,200,0.8)]" />
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    const nextPath = "/nadi/dashboard";

    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="gap-3">
              <Badge tone="maroon">Auth diperlukan</Badge>
              <CardTitle className="text-5xl">Masuk dulu untuk buka portal NADI.</CardTitle>
              <CardDescription className="text-base">
                Portal ini dikhaskan untuk staf NADI yang nak sahkan penghantaran pool selepas majoriti undian dicapai.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                href={`/sign-in?next=${encodeURIComponent(nextPath)}`}
              >
                Sign in
              </Link>
              <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href="/dashboard">
                Balik dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (session.user.role !== "nadi_staff") {
    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="gap-3">
              <Badge tone="maroon">Akses staf sahaja</Badge>
              <CardTitle className="text-5xl">Akaun ini bukan akaun NADI.</CardTitle>
              <CardDescription className="text-base">
                Guna akaun demo staf NADI dari halaman sign in untuk sahkan penghantaran pool yang sudah diluluskan.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                href="/sign-in?next=%2Fnadi%2Fdashboard"
              >
                Masuk sebagai staf NADI
              </Link>
              <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href="/dashboard">
                Balik dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const pools = poolsQuery.data ?? [];
  const pendingPools = pools.filter((pool) => pool.state === "approved");
  const activePools = pools.filter((pool) => pool.state === "active");
  const totalMembersAwaiting = pendingPools.reduce((sum, pool) => sum + pool.members.length, 0);
  const weeklySummary = summaryQuery.data;
  const isRefreshingSummary = summaryQuery.isFetching && !summaryQuery.isLoading;

  async function handleRefreshSummary() {
    try {
      const result = await summaryQuery.refetch();

      if (result.error) {
        throw result.error;
      }

      setIsRefreshCoolingDown(true);
      window.setTimeout(() => setIsRefreshCoolingDown(false), 15_000);
      toast.success("Ringkasan minggu dijana semula.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Tak dapat jana semula ringkasan minggu.");
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:py-10">
      <div className="page-shell grid gap-6">
        <header className="panel-surface rounded-[2.25rem] px-6 py-7 md:px-8 md:py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="grid gap-4">
              <div className="flex flex-wrap gap-3">
                <Badge tone="gold">Portal NADI</Badge>
                <Badge tone="forest">{session.user.kampung.name}</Badge>
              </div>
              <div className="grid gap-3">
                <h1 className="text-5xl sm:text-6xl">Pengesahan penghantaran pool.</h1>
                <p className="max-w-3xl text-base text-[color:var(--dl-slate)] sm:text-lg">
                  Halaman ini paparkan ringkasan pool di peringkat kampung, termasuk briefing mingguan BM-first untuk staf NADI. Tiada jumlah individu sensitif dipaparkan selain bilangan ahli dan status penghantaran.
                </p>
              </div>
            </div>

            <Link className={cn(buttonVariants({ variant: "outline" }), "w-full lg:w-auto")} href="/dashboard">
              <ArrowLeft aria-hidden="true" size={16} />
              Dashboard
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.75rem] border border-[color:rgba(122,46,46,0.12)] bg-[linear-gradient(160deg,rgba(122,46,46,0.96),rgba(200,148,31,0.94))] p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
                Menunggu pengesahan
              </p>
              <p className="mt-3 text-5xl font-semibold">{pendingPools.length}</p>
              <p className="mt-3 text-sm text-white/78 sm:text-base">
                Pool yang sudah lulus undian dan perlukan tindakan staf NADI.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[color:var(--dl-sand)] bg-white/82 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                Sudah active
              </p>
              <p className="mt-3 text-3xl font-semibold">{activePools.length}</p>
              <p className="mt-2 text-sm text-[color:var(--dl-slate)]">
                Pool yang sudah disahkan penghantarannya.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[color:var(--dl-sand)] bg-white/82 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                Ahli terlibat
              </p>
              <p className="mt-3 text-3xl font-semibold">{totalMembersAwaiting}</p>
              <p className="mt-2 text-sm text-[color:var(--dl-slate)]">
                Jumlah ahli merentasi semua pool yang masih menunggu pengesahan.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <Card className="overflow-hidden">
            <CardHeader className="gap-3 border-b border-[color:rgba(224,216,200,0.72)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  <Badge tone="maroon">Ringkasan Minggu</Badge>
                  {weeklySummary ? (
                    <Badge tone={weeklySummary.provider === "alibaba-qwen" ? "forest" : "gold"}>
                      {weeklySummary.provider === "alibaba-qwen" ? "AI live" : "Demo heuristic"}
                    </Badge>
                  ) : null}
                </div>
                <Button
                  className="w-full sm:w-auto"
                  disabled={summaryQuery.isLoading || isRefreshingSummary || isRefreshCoolingDown}
                  size="sm"
                  variant="outline"
                  onClick={handleRefreshSummary}
                >
                  <RefreshCw aria-hidden="true" size={16} />
                  {isRefreshingSummary
                    ? "Sedang jana..."
                    : isRefreshCoolingDown
                      ? "Tunggu sekejap"
                      : "Refresh"}
                </Button>
              </div>
              <CardTitle className="text-4xl">Briefing mingguan untuk staf NADI</CardTitle>
              <CardDescription className="text-base">
                Ringkasan ini menumpukan pola kampung untuk minggu semasa, bukan butiran individu. Ia bantu staf nampak jumlah pool baharu, item yang paling menonjol, delta trust, dan signal yang perlukan perhatian.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 py-6">
              {summaryQuery.isLoading ? (
                <>
                  <div className="h-20 animate-pulse rounded-[1.5rem] bg-[color:rgba(248,244,236,0.9)]" />
                  <div className="grid gap-3 sm:grid-cols-3">
                    {Array.from({ length: 3 }, (_, index) => (
                      <div
                        className="h-24 animate-pulse rounded-[1.25rem] bg-[color:rgba(224,216,200,0.72)]"
                        key={`nadi-summary-skeleton-${index}`}
                      />
                    ))}
                  </div>
                </>
              ) : summaryQuery.isError || !weeklySummary ? (
                <div className="rounded-[1.5rem] border border-[color:rgba(122,46,46,0.18)] bg-[color:rgba(122,46,46,0.06)] p-4 text-sm text-[color:var(--dl-maroon)]">
                  Ringkasan minggu belum dapat dijana sekarang. Cuba refresh semula bila sambungan backend kembali stabil.
                </div>
              ) : (
                <>
                  <div className="rounded-[1.75rem] border border-transparent bg-[linear-gradient(160deg,rgba(122,46,46,0.96),rgba(200,148,31,0.94))] p-5 text-white">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
                          Tempoh ringkasan
                        </p>
                        <p className="mt-2 text-sm text-white/80">
                          {formatDate(weeklySummary.weekStart)} hingga {formatDate(weeklySummary.weekEnd)}
                        </p>
                      </div>
                      <Badge className="border-white/16 bg-white/10 text-white" tone="neutral">
                        Dijana {formatDateTime(weeklySummary.generatedAt)}
                      </Badge>
                    </div>
                    <p className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
                      {weeklySummary.summary.headlineBm}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                        Pool dibentuk
                      </p>
                      <p className="mt-2 text-3xl font-semibold">{weeklySummary.metrics.poolsFormedCount}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                        Item menonjol
                      </p>
                      <p className="mt-2 text-base font-semibold">
                        {weeklySummary.metrics.topItemNameBm ?? "Belum menonjol"}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-forest)]">
                        Delta trust
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-[color:var(--dl-forest)]">
                        {weeklySummary.metrics.trustDelta > 0 ? "+" : ""}
                        {weeklySummary.metrics.trustDelta.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {weeklySummary.summary.observationsBm.map((observation) => (
                      <div
                        className="flex items-start gap-3 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4"
                        key={observation}
                      >
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:rgba(200,148,31,0.14)] text-[color:var(--dl-gold-dark)]">
                          <Sparkles aria-hidden="true" size={18} />
                        </div>
                        <p className="text-sm text-[color:var(--dl-ink)] sm:text-base">{observation}</p>
                      </div>
                    ))}
                  </div>

                  {weeklySummary.summary.anomaliesBm.length > 0 ? (
                    <div className="grid gap-3 rounded-[1.5rem] border border-[color:rgba(122,46,46,0.18)] bg-[color:rgba(122,46,46,0.06)] p-4">
                      <div className="flex items-center gap-3 text-[color:var(--dl-maroon)]">
                        <TriangleAlert aria-hidden="true" size={18} />
                        <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                          Anomali minggu ini
                        </p>
                      </div>
                      {weeklySummary.summary.anomaliesBm.map((anomaly) => (
                        <p className="text-sm text-[color:var(--dl-maroon)] sm:text-base" key={anomaly}>
                          {anomaly}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4 text-sm text-[color:var(--dl-forest)]">
                      <CheckCircle2 aria-hidden="true" size={18} />
                      Tiada anomali besar dikesan untuk minggu ini. Ritma kampung masih terkawal.
                    </div>
                  )}

                  <div className="rounded-[1.5rem] border border-[color:rgba(200,148,31,0.22)] bg-[color:rgba(200,148,31,0.08)] p-4">
                    <div className="flex items-center gap-3 text-[color:var(--dl-gold-dark)]">
                      <ShieldCheck aria-hidden="true" size={18} />
                      <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                        Cadangan tindakan
                      </p>
                    </div>
                    <p className="mt-3 text-sm text-[color:var(--dl-ink)] sm:text-base">
                      {weeklySummary.summary.suggestionBm}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-3">
              <Badge tone="forest">Signal kampung</Badge>
              <CardTitle className="text-4xl">Meter ringkas untuk semakan cepat</CardTitle>
              <CardDescription className="text-base">
                Kad ini membantu staf baca jumlah yang paling penting tanpa tengok rekod individu.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-forest)]">
                  Skor trust semasa
                </p>
                <p className="mt-2 text-4xl font-semibold text-[color:var(--dl-forest)]">
                  {weeklySummary ? Math.round(weeklySummary.metrics.trustScore) : "—"}
                </p>
                <p className="mt-2 text-sm text-[color:var(--dl-forest)]">
                  Dibaca pada peringkat kampung supaya NADI nampak health komuniti, bukan individu tertentu.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                  Bayaran direkod minggu ini
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {weeklySummary?.metrics.repaymentsThisWeek ?? 0}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                  Signal lewat
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {weeklySummary?.metrics.latePaymentEvents ?? 0}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 text-sm text-[color:var(--dl-slate)]">
                Refresh akan jana semula ringkasan minggu yang sama. Dalam demo ini, tindakan itu dikawal dengan cooldown ringkas supaya briefing tak dipanggil bertalu-talu.
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4">
          <div>
            <p className="section-kicker">Pending delivery</p>
            <h2 className="mt-2 text-4xl">Pool yang perlu disahkan</h2>
          </div>

          {pendingPools.length === 0 ? (
            <Card>
              <CardHeader className="gap-3">
                <Badge tone="forest">Semua clear</Badge>
                <CardTitle className="text-4xl">Tiada pool menunggu pengesahan sekarang.</CardTitle>
                <CardDescription className="text-base">
                  Bila majoriti undian dicapai pada mana-mana pool kampung ini, kad penghantaran akan
                  muncul semula di sini untuk tindakan staf NADI.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {pendingPools.map((pool) => {
                const selectedItem = pool.transaction?.itemNameBm ?? "Item belum direkod";
                const isPendingThisCard = confirmMutation.isPending && confirmMutation.variables === pool.id;

                return (
                  <Card key={pool.id}>
                    <CardHeader className="gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge tone="gold">Menunggu NADI</Badge>
                        <Badge tone="neutral">{pool.kampungName}</Badge>
                      </div>
                      <div className="grid gap-2">
                        <CardTitle>{pool.name}</CardTitle>
                        <CardDescription className="text-base">{selectedItem}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                            Ahli
                          </p>
                          <p className="mt-2 text-lg font-semibold">{pool.members.length}</p>
                        </div>
                        <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                            Nilai pool
                          </p>
                          <p className="mt-2 text-lg font-semibold">
                            {formatCurrency(pool.transaction?.totalAmountCents ?? 0)}
                          </p>
                        </div>
                        <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                            Diluluskan
                          </p>
                          <p className="mt-2 text-sm font-semibold">{formatDateTime(pool.approvedAt)}</p>
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-[color:rgba(200,148,31,0.22)] bg-[color:rgba(200,148,31,0.08)] p-4 text-sm text-[color:var(--dl-slate)]">
                        Ahli pool sudah setuju pada pembelian ini. Pengesahan NADI akan memindahkan pool ke
                        state active dan membuka langkah seterusnya.
                      </div>

                      <Button
                        className="w-full"
                        disabled={isPendingThisCard}
                        size="lg"
                        onClick={() => confirmMutation.mutate(pool.id)}
                      >
                        <Truck aria-hidden="true" size={18} />
                        {isPendingThisCard ? "Sedang sahkan..." : "Sahkan dah hantar"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {activePools.length > 0 ? (
          <section className="grid gap-4">
            <div>
              <p className="section-kicker">Recently confirmed</p>
              <h2 className="mt-2 text-4xl">Pool yang baru aktif</h2>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {activePools.map((pool) => (
                <Card key={pool.id}>
                  <CardHeader className="gap-3">
                    <div className="flex flex-wrap gap-3">
                      <Badge tone="forest">Active</Badge>
                      <Badge tone="neutral">{pool.kampungName}</Badge>
                    </div>
                    <CardTitle>{pool.name}</CardTitle>
                    <CardDescription className="text-base">
                      {pool.transaction?.itemNameBm ?? "Item"} disahkan pada {formatDateTime(pool.deliveredAt)}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="flex items-center gap-3 rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4 text-sm text-[color:var(--dl-forest)]">
                      <CheckCircle2 aria-hidden="true" size={18} />
                      Pool ini sudah melepasi langkah pengesahan NADI.
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
