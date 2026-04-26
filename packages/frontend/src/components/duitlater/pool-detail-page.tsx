"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  Lock,
  Share2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Vote,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { formatErrorMessage } from "@/lib/api/errors";
import { pendingSuggestionFilterAtom, pendingSuggestionIdAtom } from "@/store/pools";
import { InviteQr } from "@/components/duitlater/invite-qr";
import { PoolSuggestionsPanel } from "@/components/duitlater/pool-suggestions-panel";
import { BrushHeadline } from "@/components/duitlater/brand/zine";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoolDetailQuery } from "@/hooks/use-pools-query";
import { useSessionQuery } from "@/hooks/use-session-query";
import { poolsClient } from "@/lib/pools/client";
import { myKasihCatalogue } from "@/lib/pools/catalogue";
import {
  buildPoolShareLink,
  buildVotingState,
  calculateLiveCombinedCapCents,
  countCatalogueMatches,
  getMemberSharePreview,
  getMemberVote,
  getSelectedSuggestion,
} from "@/lib/pools/storage";
import { cn, formatCurrency } from "@/lib/utils";
import { poolNeedCategories } from "@/types/pool";
import type {
  PoolRecord,
  PoolRepaymentCycleRecord,
  PoolRepaymentCycleStatus,
  PoolSuggestionFilter,
  PoolVoteChoice,
} from "@/types/pool";

type PoolDetailPageProps = {
  poolId: string;
};

const stateLabels = {
  draft: "Draft",
  locked: "Locked",
  suggesting: "Suggesting",
  voting: "Voting",
  approved: "Approved",
  active: "Active",
  completed: "Completed",
  dissolved: "Dissolved",
} as const;

async function copyText(value: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
  } catch {
    toast.error("Couldn't copy right now.");
  }
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not yet recorded";
  }

  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getRepaymentStatusTone(status: PoolRepaymentCycleStatus) {
  if (status === "PAID") {
    return "forest" as const;
  }

  if (status === "DUE") {
    return "gold" as const;
  }

  return "neutral" as const;
}

function getRepaymentStatusLabel(status: PoolRepaymentCycleStatus) {
  if (status === "PAID") {
    return "Paid";
  }

  if (status === "DUE") {
    return "Due";
  }

  return "Upcoming";
}

function getNextDueCycle(cycles: PoolRepaymentCycleRecord[]) {
  return cycles.find((cycle) => cycle.status === "DUE") ?? null;
}

export function PoolDetailPage({ poolId }: PoolDetailPageProps) {
  const queryClient = useQueryClient();
  const [acknowledgedVotePromptKey, setAcknowledgedVotePromptKey] = useState<string | null>(null);
  const [pendingFilter, setPendingFilter] = useAtom(pendingSuggestionFilterAtom);
  const [pendingSuggestionId, setPendingSuggestionId] = useAtom(pendingSuggestionIdAtom);
  const { data: session, isLoading: isSessionLoading } = useSessionQuery();
  const { data: pool, isLoading: isPoolLoading } = usePoolDetailQuery(poolId);

  // Modal-open state is derived: open whenever the pool is in voting AND the
  // current vote round hasn't been acknowledged by this user. Closing the
  // modal acks the round; entering voting again with a new round key
  // (selectedSuggestionId / votingStartedAt) re-opens automatically.
  const currentVotePromptKey =
    pool && pool.state === "voting"
      ? `${pool.id}:${pool.votingStartedAt ?? pool.selectedSuggestionId ?? "vote"}`
      : null;
  const hasVotePending = Boolean(
    pool && session && pool.state === "voting" && !getMemberVote(pool, session.user.id),
  );
  const isVoteModalOpen =
    hasVotePending && currentVotePromptKey !== null && currentVotePromptKey !== acknowledgedVotePromptKey;
  const closeVoteModal = () => setAcknowledgedVotePromptKey(currentVotePromptKey);

  const lockMutation = useMutation({
    mutationFn: () => poolsClient.lock(poolId, session?.user.id ?? ""),
    onSuccess: (updatedPool) => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      queryClient.setQueryData(["pools", "detail", poolId], updatedPool);
      toast.success("Pool locked. The combined cap is now frozen.");
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Couldn't lock the pool right now."));
    },
  });

  const suggestMutation = useMutation<PoolRecord, Error, PoolSuggestionFilter>({
    mutationFn: (filter) => poolsClient.suggest(poolId, filter),
    onMutate: (filter) => {
      setPendingFilter(filter);
    },
    onSuccess: (updatedPool) => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      queryClient.setQueryData(["pools", "detail", poolId], updatedPool);
      toast.success("The Advisor has shortlisted items for this pool.");
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Couldn't generate suggestions right now."));
    },
    onSettled: () => {
      setPendingFilter(null);
    },
  });

  const chooseSuggestionMutation = useMutation({
    mutationFn: (suggestionId: string) => poolsClient.chooseSuggestion(poolId, suggestionId),
    onMutate: (suggestionId) => {
      setPendingSuggestionId(suggestionId);
    },
    onSuccess: (updatedPool) => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      queryClient.setQueryData(["pools", "detail", poolId], updatedPool);
      toast.success("Item selected. The pool is moving into voting.");
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Couldn't select the item right now."));
    },
    onSettled: () => {
      setPendingSuggestionId(null);
    },
  });

  const voteMutation = useMutation({
    mutationFn: (vote: PoolVoteChoice) => poolsClient.vote(poolId, session?.user.id ?? "", vote),
    onSuccess: (updatedPool, vote) => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      queryClient.setQueryData(["pools", "detail", poolId], updatedPool);
      closeVoteModal();
      toast.success(
        updatedPool.state === "approved"
          ? "Majority reached. The pool is now awaiting NADI confirmation."
          : vote === "YES"
            ? "Your YES vote has been recorded."
            : "Your NO vote has been recorded.",
      );
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Couldn't save your vote right now."));
    },
  });

  const repaymentMutation = useMutation({
    mutationFn: ({ cycleNumber, obligationId }: { cycleNumber: number; obligationId: string }) =>
      poolsClient.payRepayment(poolId, obligationId, cycleNumber),
    onSuccess: ({ pool: updatedPool, repayment }) => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      queryClient.invalidateQueries({ queryKey: ["kampung", "trust", updatedPool.kampungId] });
      queryClient.setQueryData(["pools", "detail", poolId], updatedPool);
      toast.success(`Cycle ${repayment.cycleNumber} payment recorded.`);
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Couldn't process the repayment right now."));
    },
  });

  if (isSessionLoading || isPoolLoading) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <div className="panel-surface grid gap-4 rounded-[2rem] p-6">
            <div className="h-5 w-28 animate-pulse rounded-full bg-[color:rgba(200,148,31,0.18)]" />
            <div className="h-14 w-3/4 animate-pulse rounded-[1.5rem] bg-[color:rgba(122,46,46,0.08)]" />
            <div className="h-44 animate-pulse rounded-[1.75rem] bg-[color:rgba(224,216,200,0.8)]" />
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    const nextPath = `/pools/${poolId}`;

    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="gap-3">
              <Badge tone="maroon">Sign-in required</Badge>
              <CardTitle className="text-5xl">Sign in to open the pool details.</CardTitle>
              <CardDescription className="text-base">
                Phase 2 still needs a member session so we know who created the pool and who can join or lock it.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                href={`/sign-in?next=${encodeURIComponent(nextPath)}`}
              >
                Sign in
              </Link>
              <Link
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                href={`/sign-up?next=${encodeURIComponent(nextPath)}`}
              >
                Create account
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!pool) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="gap-3">
              <Badge tone="maroon">Pool not found</Badge>
              <CardTitle className="text-5xl">This pool isn&rsquo;t available in this demo.</CardTitle>
              <CardDescription className="text-base">
                If you came from an invite link, try opening it from the same browser as the pool creator, or create a new pool from the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href="/dashboard">
                Back to dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const categoryLabel =
    poolNeedCategories.find((category) => category.value === pool.statedNeedCategory)?.label ?? "Other";
  const isMember = pool.members.some((member) => member.userId === session.user.id);
  const isInitiator = pool.initiatorUserId === session.user.id;
  const liveCombinedCapCents = calculateLiveCombinedCapCents(pool);
  const shareLink = buildPoolShareLink(pool);
  const selectedSuggestion = getSelectedSuggestion(pool);
  const activeSuggestionFilter = pendingFilter ?? pool.suggestionFilter;
  const catalogueMatchCount = countCatalogueMatches(pool, activeSuggestionFilter);

  const effectiveCapCents = pool.combinedCapCents ?? liveCombinedCapCents;
  const categoryFilteredCatalogue = myKasihCatalogue.filter(
    (item) => item.category === pool.statedNeedCategory,
  );
  const catalogueRanked = (
    categoryFilteredCatalogue.length >= 3 ? categoryFilteredCatalogue : myKasihCatalogue
  )
    .slice()
    .sort((a, b) => {
      const aAffordable = a.priceCents <= effectiveCapCents ? 0 : 1;
      const bAffordable = b.priceCents <= effectiveCapCents ? 0 : 1;
      if (aAffordable !== bAffordable) return aAffordable - bAffordable;
      return a.priceCents - b.priceCents;
    })
    .slice(0, 8);
  const affordableCount = catalogueRanked.filter((item) => item.priceCents <= effectiveCapCents).length;
  const targetProgressPct = pool.targetBudgetCents
    ? Math.min(100, Math.round((effectiveCapCents / pool.targetBudgetCents) * 100))
    : 0;
  const currentUserVote = getMemberVote(pool, session.user.id);
  const votingState = buildVotingState(pool);
  const currentUserShare = getMemberSharePreview(pool, session.user.id);
  const sharePreviewByUserId = new Map(
    pool.members.map((member) => [member.userId, getMemberSharePreview(pool, member.userId)]),
  );
  const repaymentLedger = pool.repaymentLedger ?? [];
  const repaymentSummary = pool.repaymentSummary;
  const repaymentByUserId = new Map(repaymentLedger.map((entry) => [entry.userId, entry]));
  const currentUserRepayment = repaymentByUserId.get(session.user.id) ?? null;
  const currentUserDueCycle = currentUserRepayment ? getNextDueCycle(currentUserRepayment.cycles) : null;
  const repaymentCompletionPct = repaymentSummary
    ? Math.round((repaymentSummary.cyclesPaid / Math.max(repaymentSummary.cyclesTotal, 1)) * 100)
    : 0;
  const isRepaymentState = pool.state === "active" || pool.state === "completed";
  const canVoteNow = pool.state === "voting" && !currentUserVote;
  const awaitingNadi = pool.state === "approved" && pool.transaction;

  if (!isMember) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="gap-3">
              <Badge tone="maroon">Restricted access</Badge>
              <CardTitle className="text-5xl">You&rsquo;re not a member of this pool yet.</CardTitle>
              <CardDescription className="text-base">
                Open the join link again, or ask the creator to share an active invite code.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link className={cn(buttonVariants({ variant: "primary", size: "lg" }))} href={`/join/${pool.inviteCode}`}>
                Open join page
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

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto grid w-full max-w-[1800px] gap-6">
        <header className="panel-surface rounded-[2.25rem] px-6 py-7 md:px-8 md:py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="grid gap-4">
              <div className="flex flex-wrap gap-3">
                <Badge tone="gold">{stateLabels[pool.state]}</Badge>
                <Badge tone="neutral">{pool.kampungName}</Badge>
                <Badge tone="forest">
                  {pool.state === "active" || pool.state === "completed"
                    ? "Phase 5 live"
                    : pool.state === "approved"
                      ? "Phase 4 live"
                      : "Auto refresh 2s"}
                </Badge>
              </div>
              <div className="grid gap-3">
                <BrushHeadline color="brick" size="2xl" rotate={-2} as="h1">
                  {pool.name}
                </BrushHeadline>
                <p className="max-w-3xl text-base text-[color:var(--dl-slate)] sm:text-lg">
                  {pool.statedNeedText}
                </p>
              </div>
            </div>

            <Link className={cn(buttonVariants({ variant: "outline" }), "w-full lg:w-auto")} href="/dashboard">
              <ArrowLeft aria-hidden="true" size={16} />
              Dashboard
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            <div
              className="relative overflow-hidden p-5 text-[var(--dl-zine-paper)] lg:col-span-2"
              style={{
                background: "var(--dl-zine-teal)",
                boxShadow: "5px 5px 0 var(--dl-zine-teal-deep)",
              }}
            >
              <p className="zine-display relative text-xs uppercase tracking-[0.22em] text-[var(--dl-zine-paper)] opacity-85">
                {pool.state === "locked" ? "Combined cap" : "Current combined cap"}
              </p>
              <p className="zine-display relative mt-3 text-5xl tracking-[-0.02em] sm:text-6xl">
                {formatCurrency(pool.combinedCapCents ?? liveCombinedCapCents)}
              </p>
              <p className="relative mt-3 max-w-xl text-sm text-[var(--dl-zine-paper)] opacity-85 sm:text-base">
                {pool.state === "voting"
                  ? "An item has been selected and member voting is now open. Once a majority approves, the pool moves to the approved state and awaits NADI confirmation."
                  : pool.state === "approved"
                    ? "Majority reached. The transaction summary is now locked while NADI staff confirm delivery."
                    : pool.state === "active"
                      ? "Delivery has been confirmed by NADI. This pool is now active with monthly repayment records visible to every member."
                      : pool.state === "completed"
                        ? "All repayment cycles are complete. This pool's record stays on file as a visible record for members and the village."
                  : pool.state === "suggesting"
                    ? "5 shortlisted items are available below. You can filter by category before picking one to send to voting."
                    : pool.state === "locked"
                  ? `Pool locked. Combined cap: ${formatCurrency(
                      pool.combinedCapCents ?? 0,
                    )}. Suggest items.`
                    : "Joining members continue to shift the live cap. The official value is only frozen when the initiator clicks Lock pool."}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[color:var(--dl-sand)] bg-white/82 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                Target budget
              </p>
              <p className="data-figure mt-3 text-3xl font-semibold">{formatCurrency(pool.targetBudgetCents)}</p>
              <p className="mt-2 text-sm text-[color:var(--dl-slate)]">{categoryLabel}</p>
            </div>

            <div className="rounded-[1.75rem] border border-[color:var(--dl-sand)] bg-white/82 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                Members
              </p>
              <p className="mt-3 text-3xl font-semibold">
                {pool.members.length}/{pool.maxMembers}
              </p>
              <p className="mt-2 text-sm text-[color:var(--dl-slate)]">
                Minimum 2 members before locking.
              </p>
            </div>
          </div>
        </header>

        <section
          className="panel-surface rounded-[2.25rem] px-6 py-7 md:px-8 md:py-8"
          aria-label="Pool overview"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Badge tone="forest">Pool overview</Badge>
              <h2 className="zine-display mt-2 text-3xl tracking-wide text-[var(--dl-zine-ink)] md:text-4xl">
                Statistics & available items
              </h2>
              <p className="mt-1 text-sm text-[color:var(--dl-slate)]">
                Live snapshot of the pool versus the MyKasih catalogue.
              </p>
            </div>
            <p className="zine-display text-[11px] uppercase tracking-[0.22em] text-[var(--dl-zine-brick)]">
              Category · {categoryLabel}
            </p>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[1.5rem] border-2 border-[var(--dl-zine-ink)] bg-[var(--dl-paper)] p-4" style={{ boxShadow: "4px 4px 0 var(--dl-zine-ink)" }}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                Combined cap
              </dt>
              <dd className="zine-display mt-2 text-3xl text-[var(--dl-zine-ink)]">
                {formatCurrency(effectiveCapCents)}
              </dd>
              <dd className="mt-1 text-xs text-[color:var(--dl-slate)]">
                {pool.state === "locked" ? "Locked figure" : "Live · shifts as members join"}
              </dd>
            </div>

            <div className="rounded-[1.5rem] border-2 border-[var(--dl-zine-ink)] bg-[var(--dl-paper)] p-4" style={{ boxShadow: "4px 4px 0 var(--dl-zine-ink)" }}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                Target progress
              </dt>
              <dd className="zine-display mt-2 text-3xl text-[var(--dl-zine-ink)]">
                {targetProgressPct}%
              </dd>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--dl-sand)]">
                <div
                  className="h-full rounded-full bg-[var(--dl-zine-forest)]"
                  style={{ width: `${targetProgressPct}%` }}
                />
              </div>
              <dd className="mt-1 text-xs text-[color:var(--dl-slate)]">
                of {formatCurrency(pool.targetBudgetCents)}
              </dd>
            </div>

            <div className="rounded-[1.5rem] border-2 border-[var(--dl-zine-ink)] bg-[var(--dl-paper)] p-4" style={{ boxShadow: "4px 4px 0 var(--dl-zine-ink)" }}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                Members
              </dt>
              <dd className="zine-display mt-2 text-3xl text-[var(--dl-zine-ink)]">
                {pool.members.length}
                <span className="text-base text-[color:var(--dl-slate)]"> / {pool.maxMembers}</span>
              </dd>
              <dd className="mt-1 text-xs text-[color:var(--dl-slate)]">
                {pool.maxMembers - pool.members.length} seat
                {pool.maxMembers - pool.members.length === 1 ? "" : "s"} open
              </dd>
            </div>

            <div className="rounded-[1.5rem] border-2 border-[var(--dl-zine-ink)] bg-[var(--dl-paper)] p-4" style={{ boxShadow: "4px 4px 0 var(--dl-zine-ink)" }}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                Available items
              </dt>
              <dd className="zine-display mt-2 text-3xl text-[var(--dl-zine-ink)]">
                {affordableCount}
              </dd>
              <dd className="mt-1 text-xs text-[color:var(--dl-slate)]">
                affordable now from MyKasih
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="zine-display text-xl tracking-wide text-[var(--dl-zine-ink)]">
              Available to buy
            </h3>
            <p className="text-xs text-[color:var(--dl-slate)]">
              {affordableCount} of {catalogueRanked.length} items in reach with the current cap.
            </p>
          </div>

          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {catalogueRanked.map((item) => {
              const affordable = item.priceCents <= effectiveCapCents;
              const shortBy = affordable ? 0 : item.priceCents - effectiveCapCents;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "rounded-[1.25rem] border-2 p-4",
                    affordable
                      ? "border-[var(--dl-zine-forest)] bg-[var(--dl-paper)]"
                      : "border-[var(--dl-sand)] bg-white/70 opacity-80",
                  )}
                  style={
                    affordable
                      ? { boxShadow: "3px 3px 0 var(--dl-zine-forest)" }
                      : undefined
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold leading-tight text-[var(--dl-zine-ink)]">
                      {item.nameBm}
                    </p>
                    <Badge tone={affordable ? "forest" : "neutral"}>
                      {affordable ? "In reach" : "Need more"}
                    </Badge>
                  </div>
                  <p className="zine-display mt-3 text-2xl text-[var(--dl-zine-ink)]">
                    {formatCurrency(item.priceCents)}
                  </p>
                  {affordable ? (
                    <p className="mt-1 text-xs text-[var(--dl-zine-forest)]">
                      Pool can buy this now.
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-[color:var(--dl-slate)]">
                      Short by {formatCurrency(shortBy)}
                    </p>
                  )}
                  {item.descriptionBm ? (
                    <p className="mt-2 text-xs text-[color:var(--dl-slate)] opacity-80">
                      {item.descriptionBm}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader className="gap-3">
              <Badge tone="maroon">Pool members</Badge>
              <CardTitle className="text-4xl">Who&rsquo;s in</CardTitle>
              <CardDescription className="text-base">
                The current combined cap follows each member&rsquo;s allowance below. When locked, the figure is frozen.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {pool.members.map((member) => (
                <div
                  className="grid gap-3 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/78 p-4"
                  key={member.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <strong className="text-lg">{member.name}</strong>
                        {member.isInitiator ? <Badge tone="gold">Initiator</Badge> : null}
                        {member.userId === session.user.id ? <Badge tone="forest">You</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-[color:var(--dl-slate)]">{member.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="data-figure text-2xl font-semibold">
                        {formatCurrency(member.individualAllowanceAtLockCents ?? member.individualAllowanceCents)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--dl-slate)]">
                        {member.individualAllowanceAtLockCents !== null ? "Locked allowance" : "Current allowance"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card>
              <CardHeader className="gap-3">
                <Badge tone="gold">Invitation</Badge>
                <CardTitle className="text-4xl">Pool code & link</CardTitle>
                <CardDescription className="text-base">
                  Use this code to add other members. In this frontend-only demo, the same browser gives the most stable result.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
                  <div className="grid gap-3 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Invite code
                    </p>
                    <p className="data-figure text-3xl font-semibold tracking-[0.18em]">{pool.inviteCode}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyText(pool.inviteCode, "Code copied.")}>
                        <Copy aria-hidden="true" size={14} />
                        Copy code
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => copyText(shareLink, "Link copied.")}>
                        <Share2 aria-hidden="true" size={14} />
                        Copy link
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Shareable link
                    </p>
                    <code className="break-all rounded-[1rem] bg-[color:rgba(248,244,236,0.72)] p-3 text-xs">
                      {shareLink}
                    </code>
                    <p className="text-sm text-[color:var(--dl-slate)]">
                      The QR demo below uses the same invite code so it&rsquo;s easy to scan.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                  <div className="grid gap-3 sm:grid-cols-[180px_1fr] sm:items-center">
                    <div className="mx-auto w-full max-w-[180px]">
                      <InviteQr code={pool.inviteCode} />
                    </div>
                    <div className="grid gap-3">
                      <p className="text-sm text-[color:var(--dl-slate)]">
                        Scan or open the link to go straight to the join page. As new members join, the member count and current cap on this page refresh automatically.
                      </p>
                      <Link
                        className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between sm:w-fit")}
                        href={`/join/${pool.inviteCode}`}
                      >
                        Open join page
                        <ArrowLeft aria-hidden="true" className="rotate-180" size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-3">
                <Badge
                  tone={
                    pool.state === "draft"
                      ? "maroon"
                      : pool.state === "voting"
                        ? "forest"
                        : pool.state === "approved" || pool.state === "active" || pool.state === "completed"
                          ? "forest"
                          : "gold"
                  }
                >
                  {pool.state === "draft"
                    ? "Lock pool"
                    : pool.state === "voting"
                      ? "Voting open"
                      : pool.state === "approved"
                        ? "Awaiting NADI"
                        : pool.state === "active"
                          ? "Confirmed"
                          : pool.state === "completed"
                            ? "Fully repaid"
                      : "Phase 3 active"}
                </Badge>
                <CardTitle className="text-4xl">
                  {pool.state === "draft"
                    ? "Freeze the member roster"
                    : pool.state === "voting"
                      ? "Member voting in progress"
                      : pool.state === "approved"
                        ? "Transaction summary is ready"
                        : pool.state === "active"
                          ? "The pool has moved to active"
                          : pool.state === "completed"
                            ? "This pool's cycle is complete"
                      : "Catalogue ready to choose from"}
                </CardTitle>
                <CardDescription className="text-base">
                  {pool.state === "draft"
                    ? "Only the initiator can lock. When locked, the member list and combined cap become final for the next step."
                    : pool.state === "voting"
                      ? "The item choice is set. Members who haven't voted will see the voting modal on their next visit."
                      : pool.state === "approved"
                        ? "Majority reached. Now only NADI staff need to confirm delivery."
                        : pool.state === "active"
                          ? "NADI staff have confirmed delivery. Members can now pay the current cycle and see a visible record shared by everyone."
                          : pool.state === "completed"
                            ? "Every repayment cycle has been recorded. The record stays visible so the village can see the cycle they honoured together."
                    : pool.state === "suggesting"
                      ? "Suggestions have been generated. Filter by category and pick one item from the panel below."
                      : pool.state === "locked"
                    ? `Pool locked. Combined cap: ${formatCurrency(
                        pool.combinedCapCents ?? 0,
                      )}. Suggest items.`
                      : "This pool is ready to start reviewing catalogue suggestions."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {pool.state === "draft" ? (
                  <>
                    <div className="rounded-[1.5rem] border border-dashed border-[color:rgba(122,46,46,0.18)] bg-[color:rgba(122,46,46,0.04)] p-4 text-sm text-[color:var(--dl-slate)]">
                      {isInitiator
                        ? "Add at least one more member before locking. After locking, no one else can join."
                        : "Wait for the initiator to lock the pool once everyone is in."}
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!isInitiator || pool.members.length < 2 || lockMutation.isPending}
                      onClick={() => lockMutation.mutate()}
                    >
                      <Lock aria-hidden="true" size={18} />
                      {lockMutation.isPending ? "Locking..." : "Lock pool"}
                    </Button>
                  </>
                ) : pool.state === "locked" ? (
                  <>
                    <div className="rounded-[1.5rem] border border-[color:rgba(200,148,31,0.22)] bg-[color:rgba(200,148,31,0.08)] p-4 text-sm text-[color:var(--dl-slate)]">
                      Click &lsquo;Suggest items&rsquo; to generate a shortlist based on the pool cap, the need category, and MyKasih catalogue items that fit the current budget.
                    </div>

                    <Button
                      className="w-full"
                      variant="secondary"
                      size="lg"
                      disabled={suggestMutation.isPending}
                      onClick={() => suggestMutation.mutate(pool.suggestionFilter)}
                    >
                      <Sparkles aria-hidden="true" size={18} />
                      {suggestMutation.isPending ? "Generating..." : "Suggest items"}
                    </Button>
                  </>
                ) : pool.state === "suggesting" ? (
                  <>
                    <div className="rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4 text-sm text-[color:var(--dl-forest)]">
                      5 suggestions are ready. You can filter by category or regenerate the shortlist if you want to focus on a specific catalogue area.
                    </div>

                    <Button
                      className="w-full"
                      variant="secondary"
                      size="lg"
                      disabled={suggestMutation.isPending}
                      onClick={() => suggestMutation.mutate(pool.suggestionFilter)}
                    >
                      <Sparkles aria-hidden="true" size={18} />
                      {suggestMutation.isPending ? "Regenerating..." : "Regenerate suggestions"}
                    </Button>
                  </>
                ) : (
                  <div className="grid gap-4 rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 aria-hidden="true" className="mt-0.5 text-[color:var(--dl-forest)]" size={20} />
                      <div className="grid gap-2">
                        <p className="text-base font-semibold text-[color:var(--dl-forest)]">
                          {selectedSuggestion
                            ? pool.state === "approved"
                              ? `${selectedSuggestion.nameBm} passed the vote and is awaiting NADI confirmation.`
                              : pool.state === "active"
                                ? `${selectedSuggestion.nameBm} has been confirmed for delivery to this pool.`
                                : pool.state === "completed"
                                  ? `${selectedSuggestion.nameBm} has been fully paid off by every member of this pool.`
                                : `${selectedSuggestion.nameBm} has been selected and sent to voting.`
                            : pool.state === "approved"
                              ? "This pool has been approved."
                              : pool.state === "completed"
                                ? "This pool is fully completed."
                              : "This pool is in voting."}
                        </p>
                        <p className="text-sm text-[color:var(--dl-forest)]">
                          {pool.state === "voting"
                            ? currentUserVote
                              ? `Your vote was recorded as ${currentUserVote.vote === "YES" ? "YES" : "NO"}. The tally moves as other members submit theirs.`
                              : "Your vote hasn't been recorded yet. Open the voting modal to review your share before deciding."
                            : pool.state === "approved"
                              ? "Every member now sees the same transaction summary while NADI staff confirm delivery."
                              : pool.state === "active"
                                ? "Repayment records are now open. Members can pay the current cycle directly from the ledger below."
                                : "Every cycle is complete. The record stays visible so all members see the same purchase context and outcome."}
                        </p>
                      </div>
                    </div>

                    {selectedSuggestion ? (
                      <div className="rounded-[1.25rem] bg-white/78 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                          Current selection
                        </p>
                        <p className="mt-2 text-lg font-semibold">{selectedSuggestion.nameBm}</p>
                        <p className="mt-1 text-sm text-[color:var(--dl-slate)]">
                          {formatCurrency(selectedSuggestion.priceCents)} · {selectedSuggestion.allocationPct}% of pool cap
                        </p>
                      </div>
                    ) : null}

                    {pool.state === "voting" ? (
                      <Button
                        className="w-full"
                        disabled={!canVoteNow || voteMutation.isPending}
                        size="lg"
                        onClick={() => setAcknowledgedVotePromptKey(null)}
                      >
                        <Vote aria-hidden="true" size={18} />
                        {voteMutation.isPending
                          ? "Submitting vote..."
                          : currentUserVote
                            ? "Vote submitted"
                            : "Open voting"}
                      </Button>
                    ) : awaitingNadi && session.user.role === "nadi_staff" ? (
                      <Link
                        className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full")}
                        href="/nadi/dashboard"
                      >
                        <ShieldCheck aria-hidden="true" size={18} />
                        Open NADI portal
                      </Link>
                    ) : null}
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 text-sm text-[color:var(--dl-slate)]">
                  <UsersRound aria-hidden="true" size={18} />
                  Auto refresh every 2 seconds lets you see new members without manually reloading.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {pool.state === "voting" ||
        pool.state === "approved" ||
        pool.state === "active" ||
        pool.state === "completed" ? (
          <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <Card>
              <CardHeader className="gap-3">
                <Badge tone={pool.state === "voting" || pool.state === "completed" ? "forest" : "gold"}>
                  {pool.state === "voting" ? "Vote tally" : "Pool outcome"}
                </Badge>
                <CardTitle className="text-4xl">
                  {pool.state === "voting"
                    ? "Who's said yes"
                    : pool.state === "completed"
                      ? "Summary after repayment"
                      : "Summary after voting"}
                </CardTitle>
                <CardDescription className="text-base">
                  {pool.state === "voting"
                    ? "The tally moves as members submit votes. A simple majority approves the pool automatically."
                    : pool.state === "approved"
                      ? "Vote majority reached. The next step is NADI staff confirming delivery."
                      : pool.state === "active"
                        ? "Voting is closed and delivery is confirmed. This record stays as a reference for pool members."
                        : "Every repayment cycle is complete. The record is now a complete shared reference for pool members."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-forest)]">
                      Yes
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-[color:var(--dl-forest)]">
                      {votingState.yesCount}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[color:rgba(122,46,46,0.18)] bg-[color:rgba(122,46,46,0.06)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-maroon)]">
                      No
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-[color:var(--dl-maroon)]">
                      {votingState.noCount}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Not voted
                    </p>
                    <p className="mt-2 text-3xl font-semibold">
                      {votingState.pendingMemberIds.length}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/78 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                    Majority required
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {votingState.majorityThreshold} of {votingState.totalMembers} members
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--dl-slate)]">
                    {pool.state === "voting"
                      ? votingState.pendingMemberNames.length > 0
                        ? `Awaiting votes from ${votingState.pendingMemberNames.join(", ")}.`
                        : "Every member has now submitted a vote for this round."
                      : pool.state === "approved"
                        ? "The vote passed. The share record alongside is locked for this purchase."
                        : pool.state === "active"
                          ? `NADI confirmed delivery on ${formatDateTime(pool.deliveredAt)}.`
                          : "Every repayment cycle is complete for this pool."}
                  </p>
                </div>

                {currentUserShare ? (
                  <div className="rounded-[1.5rem] border border-[color:rgba(200,148,31,0.22)] bg-[color:rgba(200,148,31,0.08)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-gold-dark)]">
                          Your share
                        </p>
                        <p className="mt-2 text-2xl font-semibold">{formatCurrency(currentUserShare.shareAmountCents)}</p>
                      </div>
                      <Badge tone="gold">{currentUserShare.sharePct}% of pool</Badge>
                    </div>
                    <p className="mt-3 text-sm text-[color:var(--dl-slate)]">
                      Your estimated monthly payment is {formatCurrency(currentUserShare.monthlyAmountCents)} for{" "}
                      {currentUserShare.totalCycles} months.
                    </p>
                    {isRepaymentState && currentUserRepayment ? (
                      <p className="mt-2 text-sm text-[color:var(--dl-forest)]">
                        {pool.state === "completed"
                          ? `All ${currentUserRepayment.totalCycles} of your cycles have been paid in full.`
                          : currentUserDueCycle
                            ? `Cycle ${currentUserDueCycle.cycleNumber} is open. Your current outstanding balance is ${formatCurrency(currentUserRepayment.outstandingAmountCents)}.`
                            : `You've paid ${currentUserRepayment.cyclesPaid}/${currentUserRepayment.totalCycles} cycles.`}
                      </p>
                    ) : currentUserVote ? (
                      <p className="mt-2 text-sm text-[color:var(--dl-forest)]">
                        Your vote: {currentUserVote.vote === "YES" ? "YES" : "NO"} · submitted{" "}
                        {formatDateTime(currentUserVote.votedAt)}
                      </p>
                    ) : pool.state === "voting" ? (
                      <p className="mt-2 text-sm text-[color:var(--dl-maroon)]">
                        Your vote hasn&rsquo;t been recorded yet for this pool.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-3">
                <Badge tone={pool.state === "active" || pool.state === "completed" ? "forest" : "gold"}>
                  {pool.state === "voting" ? "Transaction estimate" : pool.state === "completed" ? "Transaction complete" : "Pool transaction"}
                </Badge>
                <CardTitle className="text-4xl">
                  {pool.state === "voting"
                    ? "Share breakdown before approval"
                    : pool.state === "completed"
                      ? "What was settled"
                      : "What was locked in"}
                </CardTitle>
                <CardDescription className="text-base">
                  {pool.state === "voting"
                    ? "Every member sees the same share amount before deciding so the vote is clear and transparent."
                    : pool.state === "approved"
                      ? "The transaction stays visible to every member while delivery is confirmed."
                      : pool.state === "active"
                        ? "The same transaction stays on display after confirmation to show what was bought together."
                        : "The transaction and share breakdown is now complete since every repayment cycle has been recorded."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {selectedSuggestion ? (
                  <div className="grid gap-4 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                        Item
                      </p>
                      <p className="mt-2 text-lg font-semibold">{selectedSuggestion.nameBm}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                        Pool price
                      </p>
                      <p className="mt-2 text-lg font-semibold">{formatCurrency(selectedSuggestion.priceCents)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                        Status
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {pool.state === "voting"
                          ? "Awaiting majority"
                          : pool.state === "approved"
                            ? "Awaiting NADI"
                            : pool.state === "active"
                              ? "Active"
                              : "Complete"}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3">
                  {pool.members.map((member) => {
                    const share = sharePreviewByUserId.get(member.userId);
                    const repayment = repaymentByUserId.get(member.userId);

                    if (!share) {
                      return null;
                    }

                    return (
                      <div
                        className="grid gap-3 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4 sm:grid-cols-[1.2fr_0.8fr_0.8fr]"
                        key={member.id}
                      >
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <strong className="text-lg">{member.name}</strong>
                            {member.userId === session.user.id ? <Badge tone="forest">You</Badge> : null}
                          </div>
                          <p className="mt-1 text-sm text-[color:var(--dl-slate)]">
                            Share {share.sharePct}% · locked allowance{" "}
                            {formatCurrency(member.individualAllowanceAtLockCents ?? member.individualAllowanceCents)}
                            {repayment
                              ? ` · paid ${repayment.cyclesPaid}/${repayment.totalCycles} cycles`
                              : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                            Total share
                          </p>
                          <p className="mt-2 text-lg font-semibold">{formatCurrency(share.shareAmountCents)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                            Monthly
                          </p>
                          <p className="mt-2 text-lg font-semibold">{formatCurrency(share.monthlyAmountCents)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {pool.transaction ? (
                  <div className="rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4 text-sm text-[color:var(--dl-forest)]">
                    Transaction approved on {formatDateTime(pool.transaction.approvedAt)}.
                    {pool.transaction.deliveredAt
                      ? ` Delivery confirmed on ${formatDateTime(pool.transaction.deliveredAt)}.`
                      : " Awaiting delivery confirmation from NADI."}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </section>
        ) : null}

        {isRepaymentState ? (
          <section className="grid gap-4">
            <Card>
              <CardHeader className="gap-3">
                <Badge tone={pool.state === "completed" ? "forest" : "gold"}>Repayment ledger</Badge>
                <CardTitle className="text-4xl">Pool repayment record</CardTitle>
                <CardDescription className="text-base">
                  This record is visible to every member. Paid cycles stay green, the current cycle waits for the relevant member, and old entries are never deleted.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 lg:grid-cols-4">
                  <div className="rounded-[1.25rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-forest)]">
                      Cycles paid
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-[color:var(--dl-forest)]">
                      {repaymentSummary?.cyclesPaid ?? 0}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Total cycles
                    </p>
                    <p className="mt-2 text-3xl font-semibold">{repaymentSummary?.cyclesTotal ?? 0}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Members involved
                    </p>
                    <p className="mt-2 text-3xl font-semibold">{repaymentSummary?.memberCount ?? pool.members.length}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[color:rgba(200,148,31,0.22)] bg-[color:rgba(200,148,31,0.08)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-gold-dark)]">
                      Pool progress
                    </p>
                    <p className="mt-2 text-3xl font-semibold">{repaymentCompletionPct}%</p>
                  </div>
                </div>

                {currentUserRepayment ? (
                  <div className="rounded-[1.5rem] border border-[color:rgba(200,148,31,0.22)] bg-[color:rgba(200,148,31,0.08)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-gold-dark)]">
                          Your payments
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                          {pool.state === "completed"
                            ? "All settled"
                            : currentUserDueCycle
                              ? `Cycle ${currentUserDueCycle.cycleNumber} is open`
                              : "No outstanding cycles right now"}
                        </p>
                      </div>
                      <Badge tone={pool.state === "completed" || !currentUserDueCycle ? "forest" : "gold"}>
                        {currentUserRepayment.cyclesPaid}/{currentUserRepayment.totalCycles} cycles
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-[color:var(--dl-slate)]">
                      Your outstanding balance is {formatCurrency(currentUserRepayment.outstandingAmountCents)}.
                      {currentUserDueCycle
                        ? ` This cycle's amount is ${formatCurrency(currentUserDueCycle.amountCents)}.`
                        : " No further action required right now."}
                    </p>
                  </div>
                ) : null}

                {repaymentLedger.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4 text-sm text-[color:var(--dl-slate)]">
                    The repayment ledger isn&rsquo;t available for this pool yet.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {repaymentLedger.map((entry) => (
                      <div
                        className="rounded-[1.75rem] border border-[color:var(--dl-sand)] bg-white/82 p-4"
                        key={entry.obligationId}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap gap-2">
                              <strong className="text-lg">{entry.userName}</strong>
                              {entry.userId === session.user.id ? <Badge tone="forest">You</Badge> : null}
                              <Badge tone="neutral">{entry.progressPct}% complete</Badge>
                            </div>
                            <p className="mt-1 text-sm text-[color:var(--dl-slate)]">
                              Share {entry.sharePct}% · monthly {formatCurrency(entry.monthlyAmountCents)} · outstanding{" "}
                              {formatCurrency(entry.outstandingAmountCents)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                              Total share
                            </p>
                            <p className="mt-2 text-lg font-semibold">{formatCurrency(entry.shareAmountCents)}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2">
                          <div className="hidden rounded-[1.1rem] bg-[color:rgba(248,244,236,0.72)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)] sm:grid sm:grid-cols-[0.8fr_0.95fr_0.9fr_1fr_auto]">
                            <span>Cycle</span>
                            <span>Status</span>
                            <span>Amount</span>
                            <span>Paid on</span>
                            <span>Action</span>
                          </div>

                          {entry.cycles.map((cycle) => {
                            const isOwnDueCycle =
                              pool.state === "active" &&
                              entry.userId === session.user.id &&
                              cycle.status === "DUE";
                            const activeMutation = repaymentMutation.variables;
                            const isPayingThisCycle =
                              repaymentMutation.isPending &&
                              activeMutation?.obligationId === entry.obligationId &&
                              activeMutation?.cycleNumber === cycle.cycleNumber;

                            return (
                              <div
                                className="grid gap-3 rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.56)] p-4 sm:grid-cols-[0.8fr_0.95fr_0.9fr_1fr_auto] sm:items-center"
                                key={`${entry.obligationId}-${cycle.cycleNumber}`}
                              >
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)] sm:hidden">
                                    Cycle
                                  </p>
                                  <p className="mt-1 text-sm font-semibold sm:mt-0">Cycle {cycle.cycleNumber}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)] sm:hidden">
                                    Status
                                  </p>
                                  <div className="mt-1 sm:mt-0">
                                    <Badge tone={getRepaymentStatusTone(cycle.status)}>
                                      {getRepaymentStatusLabel(cycle.status)}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)] sm:hidden">
                                    Amount
                                  </p>
                                  <p className="mt-1 text-sm font-semibold sm:mt-0">
                                    {formatCurrency(cycle.amountCents)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)] sm:hidden">
                                    Paid on
                                  </p>
                                  <p className="mt-1 text-sm text-[color:var(--dl-slate)] sm:mt-0">
                                    {formatDateTime(cycle.paidAt)}
                                  </p>
                                </div>
                                <div className="sm:justify-self-end">
                                  {isOwnDueCycle ? (
                                    <Button
                                      className="w-full sm:w-auto"
                                      disabled={repaymentMutation.isPending}
                                      size="sm"
                                      onClick={() =>
                                        repaymentMutation.mutate({
                                          cycleNumber: cycle.cycleNumber,
                                          obligationId: entry.obligationId,
                                        })
                                      }
                                    >
                                      {isPayingThisCycle ? "Paying..." : "Pay this month"}
                                    </Button>
                                  ) : (
                                    <span className="text-sm text-[color:var(--dl-slate)]">
                                      {cycle.status === "PAID"
                                        ? "Done"
                                        : cycle.status === "DUE" && entry.userId === session.user.id
                                          ? "Awaiting your action"
                                          : "—"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        ) : null}

        {pool.state !== "draft" ? (
          <PoolSuggestionsPanel
            activeFilter={activeSuggestionFilter}
            catalogueMatchCount={catalogueMatchCount}
            choosePendingSuggestionId={pendingSuggestionId}
            isChoosePending={chooseSuggestionMutation.isPending}
            isSuggestPending={suggestMutation.isPending}
            onChoose={(suggestionId) => chooseSuggestionMutation.mutate(suggestionId)}
            onSuggest={(filter) => suggestMutation.mutate(filter)}
            pool={pool}
            selectedSuggestion={selectedSuggestion}
          />
        ) : null}

        {isVoteModalOpen && selectedSuggestion && currentUserShare ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-[color:rgba(26,26,26,0.52)] px-4 py-6 sm:items-center">
            <Card className="w-full max-w-2xl overflow-hidden">
              <CardHeader className="gap-3 border-b border-[color:rgba(224,216,200,0.72)]">
                <Badge tone="forest">Member vote</Badge>
                <CardTitle className="text-4xl">Review the item before voting.</CardTitle>
                <CardDescription className="text-base">
                  Every member sees the same item and share breakdown so the pool decision is made clearly.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 py-6">
                <div className="grid gap-4 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Item
                    </p>
                    <p className="mt-2 text-lg font-semibold">{selectedSuggestion.nameBm}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Price
                    </p>
                    <p className="mt-2 text-lg font-semibold">{formatCurrency(selectedSuggestion.priceCents)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Allocation
                    </p>
                    <p className="mt-2 text-lg font-semibold">{selectedSuggestion.allocationPct}% of pool cap</p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[color:rgba(200,148,31,0.22)] bg-[color:rgba(200,148,31,0.08)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-gold-dark)]">
                        Your share
                      </p>
                      <p className="mt-2 text-3xl font-semibold">{formatCurrency(currentUserShare.shareAmountCents)}</p>
                    </div>
                    <Badge tone="gold">{currentUserShare.sharePct}% of pool</Badge>
                  </div>
                  <p className="mt-3 text-sm text-[color:var(--dl-slate)]">
                    Your estimated monthly payment is {formatCurrency(currentUserShare.monthlyAmountCents)} for{" "}
                    {currentUserShare.totalCycles} months.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4 text-sm text-[color:var(--dl-forest)]">
                  {selectedSuggestion.reasoningBm}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    className="w-full"
                    disabled={voteMutation.isPending}
                    size="lg"
                    onClick={() => voteMutation.mutate("YES")}
                  >
                    <CheckCircle2 aria-hidden="true" size={18} />
                    {voteMutation.isPending ? "Submitting..." : "Yes"}
                  </Button>
                  <Button
                    className="w-full"
                    disabled={voteMutation.isPending}
                    size="lg"
                    variant="outline"
                    onClick={() => voteMutation.mutate("NO")}
                  >
                    <Clock3 aria-hidden="true" size={18} />
                    {voteMutation.isPending ? "Submitting..." : "No"}
                  </Button>
                </div>

                <Button
                  className="w-full"
                  variant="ghost"
                  onClick={closeVoteModal}
                >
                  Close for now
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  );
}
