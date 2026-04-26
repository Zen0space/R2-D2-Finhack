"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Lock, UsersRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { toast } from "sonner";
import { formatErrorMessage } from "@/lib/api/errors";
import { BrushHeadline } from "@/components/duitlater/brand/zine";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoolInviteQuery } from "@/hooks/use-pools-query";
import { useSessionQuery } from "@/hooks/use-session-query";
import { poolsClient } from "@/lib/pools/client";
import {
  buildPoolJoinPreview,
  calculateLiveCombinedCapCents,
  parsePoolJoinPreview,
} from "@/lib/pools/storage";
import { cn, formatCurrency } from "@/lib/utils";
import { poolNeedCategories } from "@/types/pool";

type JoinPoolPageProps = {
  inviteCode: string;
  searchParamsString: string;
};

export function JoinPoolPage({ inviteCode, searchParamsString }: JoinPoolPageProps) {
  const normalizedInviteCode = inviteCode.toUpperCase();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isLoading: isSessionLoading } = useSessionQuery();
  const { data: pool, isLoading: isPoolLoading } = usePoolInviteQuery(normalizedInviteCode, {
    enabled: !isSessionLoading && !!session,
  });
  const searchParams = new URLSearchParams(searchParamsString);

  const nextPath = `/join/${normalizedInviteCode}${searchParamsString ? `?${searchParamsString}` : ""}`;
  const preview = pool
    ? buildPoolJoinPreview(pool)
    : parsePoolJoinPreview(searchParams, normalizedInviteCode);

  const joinMutation = useMutation({
    mutationFn: () => {
      if (!session) {
        throw new Error("Sign in before joining a pool.");
      }

      return poolsClient.join(normalizedInviteCode, session.user);
    },
    onSuccess: (joinedPool) => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      queryClient.setQueryData(["pools", "detail", joinedPool.id], joinedPool);
      toast.success("You've joined the pool.");
      startTransition(() => router.push(`/pools/${joinedPool.id}`));
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Couldn't join the pool right now."));
    },
  });

  if (isSessionLoading || isPoolLoading) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <div className="panel-surface grid gap-4 rounded-[2rem] p-6">
            <div className="h-5 w-28 animate-pulse rounded-full bg-[color:rgba(200,148,31,0.18)]" />
            <div className="h-14 w-2/3 animate-pulse rounded-[1.5rem] bg-[color:rgba(122,46,46,0.08)]" />
            <div className="h-44 animate-pulse rounded-[1.75rem] bg-[color:rgba(224,216,200,0.8)]" />
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="h-full">
            <CardHeader className="gap-3">
              <Badge tone="gold">Join pool</Badge>
              <BrushHeadline color="brick" size="lg" rotate={-2} as="h2">Sign in first to join.</BrushHeadline>
              <CardDescription className="text-base">
                The invite code is active, but Phase 2 still needs a member identity before we can add you to the pool roster.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                href={`/sign-in?next=${encodeURIComponent(nextPath)}`}
              >
                Sign in first
              </Link>
              <Link
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                href={`/sign-up?next=${encodeURIComponent(nextPath)}`}
              >
                Create account
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-3">
              <Badge tone="maroon">Invite preview</Badge>
              <CardTitle className="text-4xl">{preview.name ?? "Invited pool"}</CardTitle>
              <CardDescription className="text-base">
                Code {preview.inviteCode} for {preview.kampungName ?? "the same village"}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {preview.targetBudgetCents !== null ? (
                <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                    Target budget
                  </p>
                  <p className="data-figure mt-2 text-3xl font-semibold">{formatCurrency(preview.targetBudgetCents)}</p>
                </div>
              ) : null}
              {preview.statedNeedText ? (
                <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 text-sm text-[color:var(--dl-slate)]">
                  {preview.statedNeedText}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!pool) {
    const categoryLabel =
      poolNeedCategories.find((category) => category.value === preview.statedNeedCategory)?.label ?? "Other";

    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <Card className="mx-auto max-w-3xl">
            <CardHeader className="gap-3">
              <Badge tone="maroon">Frontend-only limitation</Badge>
              <BrushHeadline color="brick" size="lg" rotate={-2} as="h2">Preview available, but the actual pool wasn&rsquo;t found.</BrushHeadline>
              <CardDescription className="text-base">
                For the frontend-only demo, the creator and the joining members need to use the same browser so the pool stored in local storage can be shared.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-[1.75rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-5">
                <div className="flex flex-wrap gap-3">
                  <Badge tone="gold">{preview.inviteCode}</Badge>
                  {preview.kampungName ? <Badge tone="neutral">{preview.kampungName}</Badge> : null}
                </div>
                <h2 className="mt-4 text-4xl">{preview.name ?? "Invited pool"}</h2>
                <p className="mt-3 text-sm text-[color:var(--dl-slate)]">{preview.statedNeedText ?? "No additional summary."}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] bg-white/82 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Category
                    </p>
                    <p className="mt-2 text-lg font-semibold">{categoryLabel}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/82 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Target
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {preview.targetBudgetCents !== null ? formatCurrency(preview.targetBudgetCents) : "Not set"}
                    </p>
                  </div>
                </div>
              </div>

              <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-fit")} href="/dashboard">
                Back to dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const alreadyJoined = pool.members.some((member) => member.userId === session.user.id);
  const categoryLabel =
    poolNeedCategories.find((category) => category.value === pool.statedNeedCategory)?.label ?? "Other";
  const isLocked = pool.state !== "draft";
  const isFull = pool.members.length >= pool.maxMembers;
  const liveCombinedCapCents = calculateLiveCombinedCapCents(pool);

  if (alreadyJoined) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="gap-3">
              <Badge tone="forest">Already joined</Badge>
              <BrushHeadline color="forest" size="lg" rotate={-2} as="h2">You&rsquo;re already a member of this pool.</BrushHeadline>
              <CardDescription className="text-base">
                Continue to the detail page to see other members, the invite code, or the pool&rsquo;s lock status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link className={cn(buttonVariants({ variant: "primary", size: "lg" }))} href={`/pools/${pool.id}`}>
                Open pool details
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:py-10">
      <div className="page-shell grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="h-full">
          <CardHeader className="gap-4 border-b border-[color:rgba(224,216,200,0.72)]">
            <div className="flex flex-wrap gap-3">
              <Badge tone="gold">Code {pool.inviteCode}</Badge>
              <Badge tone="neutral">{pool.kampungName}</Badge>
              <Badge tone={isLocked ? "maroon" : "forest"}>{isLocked ? "Locked" : "Still draft"}</Badge>
            </div>
            <div className="grid gap-2">
              <BrushHeadline color="brick" size="xl" rotate={-2} as="h2">{pool.name}</BrushHeadline>
              <CardDescription className="text-base">{pool.statedNeedText}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                  Target budget
                </p>
                <p className="data-figure mt-2 text-3xl font-semibold">{formatCurrency(pool.targetBudgetCents)}</p>
                <p className="mt-2 text-sm text-[color:var(--dl-slate)]">{categoryLabel}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                  Current combined cap
                </p>
                <p className="data-figure mt-2 text-3xl font-semibold">
                  {formatCurrency(pool.combinedCapCents ?? liveCombinedCapCents)}
                </p>
                <p className="mt-2 text-sm text-[color:var(--dl-slate)]">
                  {pool.members.length}/{pool.maxMembers} members
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
              <div className="flex items-center gap-3">
                <UsersRound aria-hidden="true" size={18} />
                <strong className="text-base">Who&rsquo;s in</strong>
              </div>
              <div className="mt-4 grid gap-3">
                {pool.members.map((member) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] px-4 py-3"
                    key={member.id}
                  >
                    <div>
                      <strong className="block">{member.name}</strong>
                      <span className="text-sm text-[color:var(--dl-slate)]">{member.email}</span>
                    </div>
                    <span className="data-figure text-sm font-semibold">
                      {formatCurrency(member.individualAllowanceCents)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-3">
            <Badge tone="maroon">Join pool</Badge>
            <CardTitle className="text-4xl">Join as a new member</CardTitle>
            <CardDescription className="text-base">
              You&rsquo;ll add your allowance to the pool&rsquo;s combined cap while the status remains draft.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                Your account
              </p>
              <p className="mt-2 text-lg font-semibold">{session.user.name}</p>
              <p className="mt-1 text-sm text-[color:var(--dl-slate)]">{session.user.kampung.name}</p>
            </div>

            {isLocked ? (
              <div className="flex items-start gap-3 rounded-[1.5rem] border border-[color:rgba(122,46,46,0.18)] bg-[color:rgba(122,46,46,0.04)] p-4 text-sm text-[color:var(--dl-slate)]">
                <Lock aria-hidden="true" className="mt-0.5 text-[color:var(--dl-maroon)]" size={18} />
                <span>This pool is locked, so new members can no longer join.</span>
              </div>
            ) : null}

            {isFull ? (
              <div className="flex items-start gap-3 rounded-[1.5rem] border border-[color:rgba(122,46,46,0.18)] bg-[color:rgba(122,46,46,0.04)] p-4 text-sm text-[color:var(--dl-slate)]">
                <UsersRound aria-hidden="true" className="mt-0.5 text-[color:var(--dl-maroon)]" size={18} />
                <span>This pool is full with {pool.maxMembers} members.</span>
              </div>
            ) : null}

            <Button
              className="w-full"
              size="lg"
              disabled={joinMutation.isPending || isLocked || isFull}
              onClick={() => joinMutation.mutate()}
            >
              {joinMutation.isPending ? "Joining..." : "Join pool"}
              <ArrowRight aria-hidden="true" size={18} />
            </Button>

            <div className="flex items-start gap-3 rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4 text-sm text-[color:var(--dl-forest)]">
              <CheckCircle2 aria-hidden="true" className="mt-0.5" size={18} />
              <span>Joining successfully will redirect you to this pool&rsquo;s detail page.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
