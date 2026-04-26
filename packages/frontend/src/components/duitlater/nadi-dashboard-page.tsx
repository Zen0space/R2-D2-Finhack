"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, RefreshCw, ShieldCheck, Sparkles, TriangleAlert, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { formatErrorMessage } from "@/lib/api/errors";
import { BrushHeadline, Logo, ScribbleCircle } from "@/components/duitlater/brand/zine";
import {
  useNadiDashboardQuery,
  useNadiPoolsQuery,
  useNadiWeeklySummaryQuery,
} from "@/hooks/use-pools-query";
import { useSessionQuery } from "@/hooks/use-session-query";
import { poolsClient } from "@/lib/pools/client";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not yet recorded";
  }

  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function NadiDashboardPage() {
  const queryClient = useQueryClient();
  const [isRefreshCoolingDown, setIsRefreshCoolingDown] = useState(false);
  const { data: session, isLoading: isSessionLoading } = useSessionQuery();
  const poolsQuery = useNadiPoolsQuery(session?.user ?? null);
  const summaryQuery = useNadiWeeklySummaryQuery(session?.user ?? null);
  const dashboardQuery = useNadiDashboardQuery(session?.user ?? null);

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
      toast.success("Delivery confirmed. The pool is now active.");
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
              <Badge tone="maroon">Sign-in required</Badge>
              <CardTitle className="text-5xl">Sign in to open the NADI portal.</CardTitle>
              <CardDescription className="text-base">
                This portal is reserved for NADI staff who need to confirm pool delivery once the vote majority is reached.
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
                Back to dashboard
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
              <Badge tone="maroon">Staff access only</Badge>
              <CardTitle className="text-5xl">This isn&rsquo;t a NADI account.</CardTitle>
              <CardDescription className="text-base">
                Use the NADI staff demo account from the sign-in page to confirm delivery for approved pools.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                href="/sign-in?next=%2Fnadi%2Fdashboard"
              >
                Sign in as NADI staff
              </Link>
              <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href="/dashboard">
                Back to dashboard
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
  const stats = dashboardQuery.data;
  const pendingCount = stats?.pools.pendingDelivery ?? pendingPools.length;
  const activeCount = stats?.pools.active ?? activePools.length;
  const totalMembersInKampung =
    stats?.members.totalSeats ?? pendingPools.reduce((sum, pool) => sum + pool.members.length, 0);
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
      toast.success("Weekly summary regenerated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't regenerate the weekly summary.");
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:py-10">
      <div className="page-shell grid gap-6">
        <header className="panel-surface relative overflow-hidden px-6 py-7 md:px-8 md:py-8">
          <ScribbleCircle
            color="forest"
            size={300}
            variant="loop"
            className="-right-12 -top-14 opacity-15"
          />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Logo width={130} />
                <Badge tone="gold">NADI portal</Badge>
                <Badge tone="forest">{session.user.kampung.name}</Badge>
              </div>
              <div className="grid gap-3">
                <BrushHeadline color="brick" size="2xl" rotate={-2} as="h1">
                  Pool delivery confirmation.
                </BrushHeadline>
                <p className="max-w-3xl text-base text-[color:var(--dl-slate)] sm:text-lg">
                  This page surfaces a village-level pool overview, including the weekly briefing for NADI staff. No sensitive individual amounts are shown beyond member counts and delivery status.
                </p>
              </div>
            </div>

            <Link className={cn(buttonVariants({ variant: "outline" }), "w-full lg:w-auto")} href="/dashboard">
              <ArrowLeft aria-hidden="true" size={16} />
              Dashboard
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            <div className="rounded-[1.75rem] border border-[color:rgba(122,46,46,0.12)] bg-[linear-gradient(160deg,rgba(122,46,46,0.96),rgba(200,148,31,0.94))] p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
                Awaiting confirmation
              </p>
              <p className="mt-3 text-5xl font-semibold">{pendingCount}</p>
              <p className="mt-3 text-sm text-white/78 sm:text-base">
                Pools that have passed the vote and need NADI staff action.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[color:var(--dl-sand)] bg-white/82 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                Currently active
              </p>
              <p className="mt-3 text-3xl font-semibold">{activeCount}</p>
              <p className="mt-2 text-sm text-[color:var(--dl-slate)]">
                Pools whose delivery has been confirmed.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[color:var(--dl-sand)] bg-white/82 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                Member seats
              </p>
              <p className="mt-3 text-3xl font-semibold">{totalMembersInKampung}</p>
              <p className="mt-2 text-sm text-[color:var(--dl-slate)]">
                Total pool memberships across your village.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-forest)]">
                Village trust score
              </p>
              <p className="mt-3 text-3xl font-semibold text-[color:var(--dl-forest)]">
                {stats ? Math.round(stats.kampung.trustScore) : "—"}
              </p>
              <p className="mt-2 text-sm text-[color:var(--dl-forest)]">
                {stats
                  ? `RM ${(stats.finance.totalDisbursedCents / 100).toLocaleString("en-MY")} disbursed · ${stats.finance.repaymentCompletionPct}% of repayments complete.`
                  : "Loading village metrics."}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <Card className="overflow-hidden">
            <CardHeader className="gap-3 border-b border-[color:rgba(224,216,200,0.72)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  <Badge tone="maroon">Weekly summary</Badge>
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
                    ? "Generating..."
                    : isRefreshCoolingDown
                      ? "Wait a moment"
                      : "Refresh"}
                </Button>
              </div>
              <CardTitle className="text-4xl">Weekly briefing for NADI staff</CardTitle>
              <CardDescription className="text-base">
                This summary focuses on village-level patterns for the current week, not individual details. It helps staff see new pool counts, the most prominent items, the trust delta, and signals that need attention.
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
                  The weekly summary can&rsquo;t be generated right now. Try refreshing once the backend connection is stable.
                </div>
              ) : (
                <>
                  <div className="rounded-[1.75rem] border border-transparent bg-[linear-gradient(160deg,rgba(122,46,46,0.96),rgba(200,148,31,0.94))] p-5 text-white">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
                          Summary period
                        </p>
                        <p className="mt-2 text-sm text-white/80">
                          {formatDate(weeklySummary.weekStart)} to {formatDate(weeklySummary.weekEnd)}
                        </p>
                      </div>
                      <Badge className="border-white/16 bg-white/10 text-white" tone="neutral">
                        Generated {formatDateTime(weeklySummary.generatedAt)}
                      </Badge>
                    </div>
                    <p className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
                      {weeklySummary.summary.headlineBm}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                        Pools formed
                      </p>
                      <p className="mt-2 text-3xl font-semibold">{weeklySummary.metrics.poolsFormedCount}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                        Top item
                      </p>
                      <p className="mt-2 text-base font-semibold">
                        {weeklySummary.metrics.topItemNameBm ?? "None yet"}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-forest)]">
                        Trust delta
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
                          Anomalies this week
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
                      No major anomalies detected this week. The village rhythm is steady.
                    </div>
                  )}

                  <div className="rounded-[1.5rem] border border-[color:rgba(200,148,31,0.22)] bg-[color:rgba(200,148,31,0.08)] p-4">
                    <div className="flex items-center gap-3 text-[color:var(--dl-gold-dark)]">
                      <ShieldCheck aria-hidden="true" size={18} />
                      <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                        Suggested action
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
              <Badge tone="forest">Village signal</Badge>
              <CardTitle className="text-4xl">Quick meters for staff review</CardTitle>
              <CardDescription className="text-base">
                These cards help staff scan the most important totals without looking at individual records.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-forest)]">
                  Current trust score
                </p>
                <p className="mt-2 text-4xl font-semibold text-[color:var(--dl-forest)]">
                  {weeklySummary ? Math.round(weeklySummary.metrics.trustScore) : "—"}
                </p>
                <p className="mt-2 text-sm text-[color:var(--dl-forest)]">
                  Read at the village level so NADI sees community health, not individual identifiers.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                  Payments recorded this week
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {weeklySummary?.metrics.repaymentsThisWeek ?? 0}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                  Late signals
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {weeklySummary?.metrics.latePaymentEvents ?? 0}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 text-sm text-[color:var(--dl-slate)]">
                Refresh regenerates the same week&rsquo;s summary. In this demo, it&rsquo;s rate-limited with a short cooldown so the briefing isn&rsquo;t called repeatedly.
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4">
          <div>
            <p className="section-kicker">Pending delivery</p>
            <h2 className="mt-2 text-4xl">Pools that need confirmation</h2>
          </div>

          {pendingPools.length === 0 ? (
            <Card>
              <CardHeader className="gap-3">
                <Badge tone="forest">All clear</Badge>
                <CardTitle className="text-4xl">No pools awaiting confirmation right now.</CardTitle>
                <CardDescription className="text-base">
                  When a vote majority is reached on any pool in this village, the delivery card will reappear here for NADI staff action.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {pendingPools.map((pool) => {
                const selectedItem = pool.transaction?.itemNameBm ?? "Item not yet recorded";
                const isPendingThisCard = confirmMutation.isPending && confirmMutation.variables === pool.id;

                return (
                  <Card key={pool.id}>
                    <CardHeader className="gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge tone="gold">Awaiting NADI</Badge>
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
                            Members
                          </p>
                          <p className="mt-2 text-lg font-semibold">{pool.members.length}</p>
                        </div>
                        <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                            Pool value
                          </p>
                          <p className="mt-2 text-lg font-semibold">
                            {formatCurrency(pool.transaction?.totalAmountCents ?? 0)}
                          </p>
                        </div>
                        <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                            Approved
                          </p>
                          <p className="mt-2 text-sm font-semibold">{formatDateTime(pool.approvedAt)}</p>
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-[color:rgba(200,148,31,0.22)] bg-[color:rgba(200,148,31,0.08)] p-4 text-sm text-[color:var(--dl-slate)]">
                        Pool members have agreed to this purchase. NADI confirmation will move the pool to the active state and unlock the next step.
                      </div>

                      <Button
                        className="w-full"
                        disabled={isPendingThisCard}
                        size="lg"
                        onClick={() => confirmMutation.mutate(pool.id)}
                      >
                        <Truck aria-hidden="true" size={18} />
                        {isPendingThisCard ? "Confirming..." : "Confirm delivered"}
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
              <h2 className="mt-2 text-4xl">Recently activated pools</h2>
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
                      {pool.transaction?.itemNameBm ?? "Item"} confirmed on {formatDateTime(pool.deliveredAt)}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="flex items-center gap-3 rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4 text-sm text-[color:var(--dl-forest)]">
                      <CheckCircle2 aria-hidden="true" size={18} />
                      This pool has cleared NADI confirmation.
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
