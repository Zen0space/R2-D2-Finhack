"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  LogIn,
  LogOut,
  PackageCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  Vote,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";
import { poolComposerOpenAtom } from "@/store/pools";
import { PoolComposerModal } from "@/components/duitlater/pool-composer-modal";
import { BrushHeadline, Logo, ScribbleCircle } from "@/components/duitlater/brand/zine";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useKampungTrustQuery, usePoolsQuery } from "@/hooks/use-pools-query";
import { useSessionQuery } from "@/hooks/use-session-query";
import { authClient } from "@/lib/auth/client";
import { cn, formatCurrency } from "@/lib/utils";
import { poolNeedCategories, type PoolListItem } from "@/types/pool";

const phaseFiveChecklist = [
  "Monthly repayments are recorded inside active pools.",
  "Members can open the pool ledger to review the current cycle and outstanding balance.",
  "The village trust score moves with the whole community's repayment record.",
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

function getPoolAction(pool: PoolListItem) {
  switch (pool.state) {
    case "draft":
      return {
        body: "Invite enough members before the combined cap can be locked.",
        cta: "Open and share invite",
        icon: Users,
        title: "Complete your pool roster",
      };
    case "locked":
    case "suggesting":
      return {
        body: "The pool is locked. Ask Penasihat for items that fit the combined cap.",
        cta: "View item suggestions",
        icon: Sparkles,
        title: "Get Penasihat suggestions",
      };
    case "voting":
      return {
        body: "An item has been selected. Review the vote so the pool can move to approval.",
        cta: "Review vote",
        icon: Vote,
        title: "Voting is in progress",
      };
    case "approved":
      return {
        body: "The pool is approved. NADI confirms delivery before repayments begin.",
        cta: "Track delivery",
        icon: PackageCheck,
        title: "Waiting for NADI confirmation",
      };
    case "active":
      return {
        body: "The repayment cycle is active. Open the ledger to review this month's payment.",
        cta: "Pay / view ledger",
        icon: CreditCard,
        title: "This month's payment",
      };
    case "completed":
      return {
        body: "This pool is complete. Its record remains as proof of community reliability.",
        cta: "View completed record",
        icon: CheckCircle2,
        title: "Pool completed",
      };
    case "dissolved":
      return {
        body: "This pool has been dissolved and has no further action.",
        cta: "View record",
        icon: Clock3,
        title: "Pool dissolved",
      };
  }
}

function extractInviteCode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Match either a bare code (alphanumeric 4–32) or the last path segment of a URL.
  const fromUrl = trimmed.match(/\/join\/([A-Za-z0-9]{4,32})/);
  if (fromUrl?.[1]) return fromUrl[1].toUpperCase();
  const bare = trimmed.match(/^[A-Za-z0-9]{4,32}$/);
  if (bare) return trimmed.toUpperCase();
  return null;
}

export function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isComposerOpen, setIsComposerOpen] = useAtom(poolComposerOpenAtom);
  const [joinInput, setJoinInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);

  function handleJoinSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = extractInviteCode(joinInput);
    if (!code) {
      setJoinError("Paste a valid invite code or link.");
      return;
    }
    setJoinError(null);
    startTransition(() => router.push(`/join/${code}`));
  }

  async function handleJoinPaste() {
    if (typeof navigator === "undefined" || !navigator.clipboard?.readText) {
      toast.error("Clipboard not available — paste manually.");
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      setJoinInput(text);
      setJoinError(null);
    } catch {
      toast.error("Couldn't read clipboard. Paste manually.");
    }
  }
  const { data: session, isLoading } = useSessionQuery();
  const poolsQuery = usePoolsQuery(session?.user.id ?? null);
  const trustQuery = useKampungTrustQuery(session?.user.kampung.id ?? null);

  const signOutMutation = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(["auth", "session"], null);
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      toast.success("You've been signed out.");
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
              <Badge tone="maroon">Not signed in</Badge>
              <CardTitle className="text-5xl">The dashboard is waiting for your session.</CardTitle>
              <CardDescription className="text-base">
                For Phase 2, you need to sign in first so the system knows whose allowance will join the pool.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link className={cn(buttonVariants({ variant: "primary", size: "lg" }))} href="/sign-in">
                Sign in now
              </Link>
              <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href="/sign-up">
                Create account
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
  const nextActionPool =
    pools.find((pool) => pool.state === "active") ??
    pools.find((pool) => pool.state === "voting") ??
    pools.find((pool) => pool.state === "approved") ??
    pools.find((pool) => pool.state === "locked" || pool.state === "suggesting") ??
    pools.find((pool) => pool.state === "draft") ??
    pools.find((pool) => pool.state === "completed") ??
    pools.at(0);
  const nextAction = nextActionPool ? getPoolAction(nextActionPool) : null;
  const NextActionIcon = nextAction?.icon ?? ShieldCheck;
  const trust = trustQuery.data;
  const trustProgress = trust ? Math.max(0, Math.min(100, Math.round(trust.score))) : 0;

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
                  <Badge tone="forest">My DuitLater</Badge>
                  {isNadiStaff ? <Badge tone="maroon">NADI staff</Badge> : null}
                </div>
                <div className="grid gap-3">
                  <BrushHeadline color="brick" size="2xl" rotate={-2} as="h1">
                    Welcome, {firstName}.
                  </BrushHeadline>
                  <p className="max-w-3xl text-base text-[color:var(--dl-slate)] sm:text-lg">
                    {isNadiStaff
                      ? "Review village delivery work from the staff portal, then return here for the member-facing repayment view."
                      : "Create or join a pool, follow the vote, and keep track of repayments once delivery is confirmed."}
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                {!isNadiStaff ? (
                  <Button className="w-full sm:w-auto" size="default" onClick={() => setIsComposerOpen(true)}>
                    <Plus aria-hidden="true" size={16} />
                    Create pool
                  </Button>
                ) : null}
                {isNadiStaff ? (
                  <Link
                    className={cn(buttonVariants({ variant: "primary" }), "w-full sm:w-auto")}
                    href="/nadi/dashboard"
                  >
                    <ShieldCheck aria-hidden="true" size={16} />
                    NADI portal
                  </Link>
                ) : null}
                <Button
                  className="w-full sm:w-auto"
                  variant="outline"
                  size="default"
                  onClick={() => signOutMutation.mutate()}
                  disabled={signOutMutation.isPending}
                >
                  <LogOut aria-hidden="true" size={16} />
                  {signOutMutation.isPending ? "Signing out..." : "Sign out"}
                </Button>
              </div>
            </div>

            {!isNadiStaff ? (
              <form
                className="relative mt-6 grid gap-2 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 sm:flex sm:items-center"
                onSubmit={handleJoinSubmit}
              >
                <div className="grid gap-1 sm:flex-1">
                  <label
                    htmlFor="join-code-input"
                    className="zine-display text-[10px] uppercase tracking-[0.22em] text-[color:var(--dl-slate)]"
                  >
                    Got an invite? Paste code or link
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="join-code-input"
                      placeholder="E7UG2Z96 or https://duitlater.com/join/E7UG2Z96"
                      value={joinInput}
                      onChange={(event) => {
                        setJoinInput(event.target.value);
                        if (joinError) setJoinError(null);
                      }}
                      autoComplete="off"
                      spellCheck={false}
                      aria-invalid={Boolean(joinError)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={handleJoinPaste}
                      title="Paste from clipboard"
                    >
                      Paste
                    </Button>
                  </div>
                  {joinError ? (
                    <p className="text-xs text-[color:var(--dl-brick)]">{joinError}</p>
                  ) : null}
                </div>
                <Button type="submit" size="default" className="sm:self-end">
                  <LogIn aria-hidden="true" size={16} />
                  Join pool
                </Button>
              </form>
            ) : null}

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
                      My PayLater
                    </span>
                    <ShieldCheck aria-hidden="true" size={20} />
                  </div>
                  <CardDescription className="text-[var(--dl-zine-paper)] opacity-80">
                    {isNadiStaff
                      ? "This NADI demo account still carries the same village profile so you can review pool delivery for the Felda Gedangsa community."
                      : "This personal allowance becomes your contribution when you join or create a pool."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative grid gap-4 py-6">
                  <p className="zine-display text-5xl tracking-[-0.02em] sm:text-7xl">
                    {formatCurrency(user.individualPayLaterAllowanceCents)}
                  </p>
                  <p className="max-w-xl text-sm text-[var(--dl-zine-paper)] opacity-85 sm:text-base">
                    {isNadiStaff
                      ? `This account is linked to ${user.kampung.name}. Open the NADI portal to see pools awaiting delivery confirmation.`
                      : `You're from ${user.kampung.name}. Pools now use locked member allowances to compute vote shares, transactions, and repayment records.`}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="border border-[rgba(245,240,220,0.25)] bg-[rgba(31,61,56,0.6)] p-4">
                      <p className="zine-display text-xs uppercase tracking-[0.18em] text-[var(--dl-zine-paper)] opacity-80">
                        Draft pools
                      </p>
                      <p className="zine-display mt-2 text-4xl text-[var(--dl-zine-paper)]">{draftCount}</p>
                    </div>
                    <div className="border border-[rgba(245,240,220,0.25)] bg-[rgba(31,61,56,0.6)] p-4">
                      <p className="zine-display text-xs uppercase tracking-[0.18em] text-[var(--dl-zine-paper)] opacity-80">
                        Active payments
                      </p>
                      <p className="zine-display mt-2 text-4xl text-[var(--dl-zine-paper)]">{activeCount}</p>
                    </div>
                    <div className="border border-[rgba(245,240,220,0.25)] bg-[rgba(31,61,56,0.6)] p-4 sm:col-span-2">
                      <p className="zine-display text-xs uppercase tracking-[0.18em] text-[var(--dl-zine-paper)] opacity-80">
                        {isNadiStaff ? "Awaiting NADI" : "Completed pools"}
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
                  <Badge tone="maroon">Next action</Badge>
                  <CardTitle className="text-4xl">
                    {isNadiStaff
                      ? "Open the NADI portal."
                      : nextAction
                        ? nextAction.title
                        : "Create your first pool."}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {isNadiStaff
                      ? "Approved pools need delivery confirmation before members can start repayment."
                      : nextAction
                        ? nextAction.body
                        : "Start with a small group. Once members join, the pool can lock its combined PayLater cap."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-start gap-3 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 text-sm text-[color:var(--dl-slate)]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-[color:rgba(122,46,46,0.1)] text-[color:var(--dl-maroon)]">
                      <NextActionIcon aria-hidden="true" size={18} />
                    </div>
                    <div className="grid gap-1">
                      <p className="font-semibold text-[color:var(--dl-ink)]">
                        {isNadiStaff
                          ? "Delivery confirmation keeps the repayment timeline clean."
                          : nextActionPool
                            ? nextActionPool.name
                            : "No pool yet"}
                      </p>
                      <p>
                        {isNadiStaff
                          ? "Use the staff view for delivery actions. Members will see repayment records here after confirmation."
                          : nextActionPool
                            ? `${stateLabel[nextActionPool.state]} · ${nextActionPool.memberCount}/${nextActionPool.memberCount + nextActionPool.remainingSlots} members`
                            : "You can create a pool now or join one through an invite link."}
                      </p>
                    </div>
                  </div>
                  {isNadiStaff ? (
                    <Link
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
                      href="/nadi/dashboard"
                    >
                      <ShieldCheck aria-hidden="true" size={18} />
                      Open NADI portal
                    </Link>
                  ) : nextActionPool && nextAction ? (
                    <Link
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
                      href={`/pools/${nextActionPool.id}`}
                    >
                      <ArrowRight aria-hidden="true" size={18} />
                      {nextAction.cta}
                    </Link>
                  ) : (
                    <Button className="w-full" variant="outline" size="lg" onClick={() => setIsComposerOpen(true)}>
                      <Plus aria-hidden="true" size={18} />
                      Create your first pool
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </header>

          <section className="grid gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">My Pools</p>
                <h2 className="mt-2 text-4xl">Pools you&rsquo;ve created or joined</h2>
              </div>
              {isNadiStaff ? (
                <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }))} href="/nadi/dashboard">
                  <ShieldCheck aria-hidden="true" size={16} />
                  Open NADI portal
                </Link>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setIsComposerOpen(true)}>
                  <Plus aria-hidden="true" size={16} />
                  Add another
                </Button>
              )}
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
                  <Badge tone="maroon">Nothing yet</Badge>
                  <CardTitle className="text-4xl">
                    {isNadiStaff ? "No pools to monitor yet." : "No pools yet. Create or join one."}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {isNadiStaff
                      ? "When a pool passes voting in this village, the NADI portal will start showing delivery cards here and on the dedicated staff page."
                      : "As soon as you create a pool, the pool detail card will appear here with target budget, invite code, and the live cap."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  {isNadiStaff ? (
                    <Link className={cn(buttonVariants({ variant: "primary", size: "lg" }))} href="/nadi/dashboard">
                      <ShieldCheck aria-hidden="true" size={18} />
                      NADI portal
                    </Link>
                  ) : (
                    <Button size="lg" onClick={() => setIsComposerOpen(true)}>
                      <Plus aria-hidden="true" size={18} />
                      Create pool
                    </Button>
                  )}
                  <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href="/">
                    View overview
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {pools.map((pool) => {
                  const categoryLabel =
                    poolNeedCategories.find((category) => category.value === pool.statedNeedCategory)?.label ??
                    "Other";
                  const poolAction = getPoolAction(pool);
                  const PoolActionIcon = poolAction.icon;

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
                          <p className="text-sm text-[color:var(--dl-slate)]">{poolAction.body}</p>
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
                              Members
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
                          <span className="inline-flex items-center gap-2">
                            <PoolActionIcon aria-hidden="true" size={16} />
                            {poolAction.cta}
                          </span>
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
                <Badge tone="forest">Profile</Badge>
                <CardTitle className="text-4xl">Member summary</CardTitle>
                <CardDescription className="text-base">
                  Your identity and village travel with every action you take, including pool votes and NADI confirmations.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.7)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                    Name
                  </p>
                  <p className="mt-2 text-xl font-semibold">{user.name}</p>
                </div>
                <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/78 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                    Email
                  </p>
                  <p className="mt-2 text-lg">{user.email}</p>
                </div>
                <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/78 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                    Village
                  </p>
                  <p className="mt-2 text-lg">
                    {user.kampung.name}, {user.kampung.district}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-3">
                <Badge tone={trust ? getTrustTone(trust.score) : "gold"}>Trust score</Badge>
                <CardTitle className="text-4xl">Your village in the repayment phase</CardTitle>
                <CardDescription className="text-base">
                  The visible record is no longer just voting and delivery. Monthly repayments are now shaping the village reputation collectively.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {trust ? (
                  <div className="overflow-hidden rounded-[1.5rem] border border-transparent bg-[linear-gradient(160deg,rgba(122,46,46,0.96),rgba(200,148,31,0.94))] p-5 text-white">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
                          Your village trust score
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
                      {`Your village trust score: ${Math.round(trust.score)}. As members keep to the repayment cycle, this record strengthens for the whole community.`}
                    </p>
                    <div className="mt-5 grid gap-2">
                      <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
                        <span>Community reliability</span>
                        <span>{trustProgress}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-black/20">
                        <div
                          className="h-full rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.35)]"
                          style={{ width: `${trustProgress}%` }}
                        />
                      </div>
                    </div>
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
                          Village pools
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">{trust.poolCount}</p>
                      </div>
                    </div>
                  </div>
                ) : trustQuery.isLoading ? (
                  <div className="panel-surface h-44 animate-pulse rounded-[1.75rem] bg-[color:rgba(224,216,200,0.72)]" />
                ) : (
                  <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 text-sm text-[color:var(--dl-slate)]">
                    The village trust score can&rsquo;t be loaded right now. This page will retry automatically.
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
                  Active pools now hold the repayment ledger, while this dashboard keeps the village trust score visible as a shared signal.
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
