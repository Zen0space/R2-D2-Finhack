"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Lock, UsersRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { toast } from "sonner";
import { formatErrorMessage } from "@/lib/api/errors";
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
        throw new Error("Sign in dulu untuk sertai pool.");
      }

      return poolsClient.join(normalizedInviteCode, session.user);
    },
    onSuccess: (joinedPool) => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      queryClient.setQueryData(["pools", "detail", joinedPool.id], joinedPool);
      toast.success("Anda dah berjaya sertai pool ini.");
      startTransition(() => router.push(`/pools/${joinedPool.id}`));
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Tak dapat sertai pool sekarang."));
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
              <CardTitle className="text-5xl">Auth dulu, baru boleh sertai.</CardTitle>
              <CardDescription className="text-base">
                Kod jemputan ini aktif, tapi Phase 2 masih perlukan identiti ahli sebelum tambah anda
                ke dalam roster pool.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                href={`/sign-in?next=${encodeURIComponent(nextPath)}`}
              >
                Sign in dulu
              </Link>
              <Link
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                href={`/sign-up?next=${encodeURIComponent(nextPath)}`}
              >
                Cipta akaun
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-3">
              <Badge tone="maroon">Preview jemputan</Badge>
              <CardTitle className="text-4xl">{preview.name ?? "Pool jemputan"}</CardTitle>
              <CardDescription className="text-base">
                Kod {preview.inviteCode} untuk kampung {preview.kampungName ?? "yang sama"}.
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
      poolNeedCategories.find((category) => category.value === preview.statedNeedCategory)?.label ?? "Lain-lain";

    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <Card className="mx-auto max-w-3xl">
            <CardHeader className="gap-3">
              <Badge tone="maroon">Frontend-only limitation</Badge>
              <CardTitle className="text-5xl">Preview ada, tapi pool sebenar tak ditemui dalam browser ini.</CardTitle>
              <CardDescription className="text-base">
                Untuk demo frontend-only, pencipta dan ahli yang join perlu guna browser yang sama
                supaya local storage pool dapat dikongsi.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-[1.75rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-5">
                <div className="flex flex-wrap gap-3">
                  <Badge tone="gold">{preview.inviteCode}</Badge>
                  {preview.kampungName ? <Badge tone="neutral">{preview.kampungName}</Badge> : null}
                </div>
                <h2 className="mt-4 text-4xl">{preview.name ?? "Pool jemputan"}</h2>
                <p className="mt-3 text-sm text-[color:var(--dl-slate)]">{preview.statedNeedText ?? "Tiada ringkasan tambahan."}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] bg-white/82 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Kategori
                    </p>
                    <p className="mt-2 text-lg font-semibold">{categoryLabel}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/82 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Target
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {preview.targetBudgetCents !== null ? formatCurrency(preview.targetBudgetCents) : "Belum dinyatakan"}
                    </p>
                  </div>
                </div>
              </div>

              <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-fit")} href="/dashboard">
                Balik ke dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const alreadyJoined = pool.members.some((member) => member.userId === session.user.id);
  const categoryLabel =
    poolNeedCategories.find((category) => category.value === pool.statedNeedCategory)?.label ?? "Lain-lain";
  const isLocked = pool.state !== "draft";
  const isFull = pool.members.length >= pool.maxMembers;
  const liveCombinedCapCents = calculateLiveCombinedCapCents(pool);

  if (alreadyJoined) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="gap-3">
              <Badge tone="forest">Dah sertai</Badge>
              <CardTitle className="text-5xl">Anda memang dah ada dalam pool ini.</CardTitle>
              <CardDescription className="text-base">
                Teruskan ke halaman detail untuk lihat ahli lain, invite code, atau status lock pool.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link className={cn(buttonVariants({ variant: "primary", size: "lg" }))} href={`/pools/${pool.id}`}>
                Buka detail pool
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
              <Badge tone="gold">Kod {pool.inviteCode}</Badge>
              <Badge tone="neutral">{pool.kampungName}</Badge>
              <Badge tone={isLocked ? "maroon" : "forest"}>{isLocked ? "Sudah lock" : "Masih draft"}</Badge>
            </div>
            <div className="grid gap-2">
              <CardTitle className="text-5xl">{pool.name}</CardTitle>
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
                  Combined cap semasa
                </p>
                <p className="data-figure mt-2 text-3xl font-semibold">
                  {formatCurrency(pool.combinedCapCents ?? liveCombinedCapCents)}
                </p>
                <p className="mt-2 text-sm text-[color:var(--dl-slate)]">
                  {pool.members.length}/{pool.maxMembers} ahli
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
              <div className="flex items-center gap-3">
                <UsersRound aria-hidden="true" size={18} />
                <strong className="text-base">Siapa dah masuk</strong>
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
            <Badge tone="maroon">Sertai pool</Badge>
            <CardTitle className="text-4xl">Masuk sebagai ahli baharu</CardTitle>
            <CardDescription className="text-base">
              Anda akan tambah allowance anda ke combined cap pool ini selagi status masih draft.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                Akaun anda
              </p>
              <p className="mt-2 text-lg font-semibold">{session.user.name}</p>
              <p className="mt-1 text-sm text-[color:var(--dl-slate)]">{session.user.kampung.name}</p>
            </div>

            {isLocked ? (
              <div className="flex items-start gap-3 rounded-[1.5rem] border border-[color:rgba(122,46,46,0.18)] bg-[color:rgba(122,46,46,0.04)] p-4 text-sm text-[color:var(--dl-slate)]">
                <Lock aria-hidden="true" className="mt-0.5 text-[color:var(--dl-maroon)]" size={18} />
                <span>Pool ini dah dikunci, jadi ahli baharu dah tak boleh masuk.</span>
              </div>
            ) : null}

            {isFull ? (
              <div className="flex items-start gap-3 rounded-[1.5rem] border border-[color:rgba(122,46,46,0.18)] bg-[color:rgba(122,46,46,0.04)] p-4 text-sm text-[color:var(--dl-slate)]">
                <UsersRound aria-hidden="true" className="mt-0.5 text-[color:var(--dl-maroon)]" size={18} />
                <span>Pool ini dah penuh dengan {pool.maxMembers} ahli.</span>
              </div>
            ) : null}

            <Button
              className="w-full"
              size="lg"
              disabled={joinMutation.isPending || isLocked || isFull}
              onClick={() => joinMutation.mutate()}
            >
              {joinMutation.isPending ? "Sedang sertai..." : "Sertai pool"}
              <ArrowRight aria-hidden="true" size={18} />
            </Button>

            <div className="flex items-start gap-3 rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4 text-sm text-[color:var(--dl-forest)]">
              <CheckCircle2 aria-hidden="true" className="mt-0.5" size={18} />
              <span>Berjaya join akan terus redirect ke halaman detail pool ini.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
