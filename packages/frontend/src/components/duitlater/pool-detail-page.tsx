"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Lock,
  Share2,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { InviteQr } from "@/components/duitlater/invite-qr";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoolDetailQuery } from "@/hooks/use-pools-query";
import { useSessionQuery } from "@/hooks/use-session-query";
import { poolsClient } from "@/lib/pools/client";
import { buildPoolShareLink, calculateLiveCombinedCapCents } from "@/lib/pools/storage";
import { cn, formatCurrency } from "@/lib/utils";
import { poolNeedCategories } from "@/types/pool";

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
    toast.error("Tak dapat copy sekarang.");
  }
}

export function PoolDetailPage({ poolId }: PoolDetailPageProps) {
  const queryClient = useQueryClient();
  const { data: session, isLoading: isSessionLoading } = useSessionQuery();
  const { data: pool, isLoading: isPoolLoading } = usePoolDetailQuery(poolId);

  const lockMutation = useMutation({
    mutationFn: () => poolsClient.lock(poolId, session?.user.id ?? ""),
    onSuccess: (updatedPool) => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      queryClient.setQueryData(["pools", "detail", poolId], updatedPool);
      toast.success("Pool dah dikunci. Combined cap telah dibekukan.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Tak dapat lock pool sekarang.");
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
              <Badge tone="maroon">Auth diperlukan</Badge>
              <CardTitle className="text-5xl">Sign in dulu untuk buka detail pool.</CardTitle>
              <CardDescription className="text-base">
                Phase 2 masih perlukan sesi ahli supaya kita tahu siapa pencipta pool dan siapa yang
                layak join atau lock.
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
                Cipta akaun
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
              <Badge tone="maroon">Pool tak jumpa</Badge>
              <CardTitle className="text-5xl">Halaman pool ini belum ada dalam demo ini.</CardTitle>
              <CardDescription className="text-base">
                Kalau anda datang dari pautan jemputan, cuba buka semula dari browser yang sama dengan
                pencipta pool atau cipta pool baharu dari dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href="/dashboard">
                Kembali ke dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const categoryLabel =
    poolNeedCategories.find((category) => category.value === pool.statedNeedCategory)?.label ?? "Lain-lain";
  const isMember = pool.members.some((member) => member.userId === session.user.id);
  const isInitiator = pool.initiatorUserId === session.user.id;
  const liveCombinedCapCents = calculateLiveCombinedCapCents(pool);
  const shareLink = buildPoolShareLink(pool);

  if (!isMember) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:py-10">
        <div className="page-shell">
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="gap-3">
              <Badge tone="maroon">Akses terhad</Badge>
              <CardTitle className="text-5xl">Anda belum jadi ahli pool ini.</CardTitle>
              <CardDescription className="text-base">
                Buka pautan join semula atau minta pencipta hantar kod jemputan yang aktif.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link className={cn(buttonVariants({ variant: "primary", size: "lg" }))} href={`/join/${pool.inviteCode}`}>
                Buka halaman join
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

  return (
    <main className="px-4 py-6 sm:px-6 lg:py-10">
      <div className="page-shell grid gap-6">
        <header className="panel-surface rounded-[2.25rem] px-6 py-7 md:px-8 md:py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="grid gap-4">
              <div className="flex flex-wrap gap-3">
                <Badge tone="gold">{stateLabels[pool.state]}</Badge>
                <Badge tone="neutral">{pool.kampungName}</Badge>
                <Badge tone="forest">Auto refresh 2s</Badge>
              </div>
              <div className="grid gap-3">
                <h1 className="text-5xl sm:text-6xl">{pool.name}</h1>
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
            <div className="rounded-[1.75rem] border border-[color:rgba(122,46,46,0.12)] bg-[linear-gradient(160deg,rgba(122,46,46,0.96),rgba(200,148,31,0.94))] p-5 text-white lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
                {pool.state === "locked" ? "Combined cap" : "Combined cap semasa"}
              </p>
              <p className="data-figure mt-3 text-5xl font-semibold tracking-[-0.08em] sm:text-6xl">
                {formatCurrency(pool.combinedCapCents ?? liveCombinedCapCents)}
              </p>
              <p className="mt-3 max-w-xl text-sm text-white/78 sm:text-base">
                {pool.state === "locked"
                  ? `Pool dah dikunci. Combined cap: ${formatCurrency(
                      pool.combinedCapCents ?? 0,
                    )}. Cadangkan barang.`
                  : "Ahli yang join akan terus mengubah cap semasa ini. Nilai rasmi hanya dibekukan bila initiator klik Lock pool."}
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
                Ahli
              </p>
              <p className="mt-3 text-3xl font-semibold">
                {pool.members.length}/{pool.maxMembers}
              </p>
              <p className="mt-2 text-sm text-[color:var(--dl-slate)]">
                Minimum 2 ahli sebelum lock.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader className="gap-3">
              <Badge tone="maroon">Ahli pool</Badge>
              <CardTitle className="text-4xl">Siapa dah masuk</CardTitle>
              <CardDescription className="text-base">
                Combined cap semasa akan ikut jumlah allowance ahli di bawah. Bila lock, angka ini dibekukan.
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
                        {member.userId === session.user.id ? <Badge tone="forest">Anda</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-[color:var(--dl-slate)]">{member.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="data-figure text-2xl font-semibold">
                        {formatCurrency(member.individualAllowanceAtLockCents ?? member.individualAllowanceCents)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--dl-slate)]">
                        {member.individualAllowanceAtLockCents !== null ? "Allowance terkunci" : "Allowance semasa"}
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
                <Badge tone="gold">Jemputan</Badge>
                <CardTitle className="text-4xl">Kod & pautan pool</CardTitle>
                <CardDescription className="text-base">
                  Guna kod ini untuk tambah ahli lain. Dalam demo frontend-only ini, browser yang sama akan bagi hasil paling stabil.
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
                      <Button variant="outline" size="sm" onClick={() => copyText(pool.inviteCode, "Kod berjaya dicopy.")}>
                        <Copy aria-hidden="true" size={14} />
                        Copy kod
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => copyText(shareLink, "Pautan berjaya dicopy.")}>
                        <Share2 aria-hidden="true" size={14} />
                        Copy link
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/82 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Pautan shareable
                    </p>
                    <code className="break-all rounded-[1rem] bg-[color:rgba(248,244,236,0.72)] p-3 text-xs">
                      {shareLink}
                    </code>
                    <p className="text-sm text-[color:var(--dl-slate)]">
                      QR demo di bawah diberi dari invite code yang sama supaya mudah scan.
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
                        Scan atau buka pautan untuk terus ke halaman join. Bila ahli baharu masuk,
                        jumlah ahli dan cap semasa di halaman ini akan refresh sendiri.
                      </p>
                      <Link
                        className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between sm:w-fit")}
                        href={`/join/${pool.inviteCode}`}
                      >
                        Buka halaman join
                        <ArrowLeft aria-hidden="true" className="rotate-180" size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-3">
                <Badge tone={pool.state === "locked" ? "forest" : "maroon"}>
                  {pool.state === "locked" ? "Pool dikunci" : "Lock pool"}
                </Badge>
                <CardTitle className="text-4xl">
                  {pool.state === "locked" ? "Sedia untuk Phase 3" : "Bekukan roster ahli"}
                </CardTitle>
                <CardDescription className="text-base">
                  {pool.state === "locked"
                    ? `Pool dah dikunci. Combined cap: ${formatCurrency(
                        pool.combinedCapCents ?? 0,
                      )}. Cadangkan barang.`
                    : "Hanya initiator boleh lock. Bila dikunci, senarai ahli dan combined cap jadi rasmi untuk langkah seterusnya."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {pool.state === "draft" ? (
                  <>
                    <div className="rounded-[1.5rem] border border-dashed border-[color:rgba(122,46,46,0.18)] bg-[color:rgba(122,46,46,0.04)] p-4 text-sm text-[color:var(--dl-slate)]">
                      {isInitiator
                        ? "Tambah sekurang-kurangnya seorang ahli lagi sebelum lock. Lepas lock, tak boleh join lagi."
                        : "Tunggu initiator lock pool ini bila semua ahli dah cukup."}
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!isInitiator || pool.members.length < 2 || lockMutation.isPending}
                      onClick={() => lockMutation.mutate()}
                    >
                      <Lock aria-hidden="true" size={18} />
                      {lockMutation.isPending ? "Sedang lock..." : "Lock pool"}
                    </Button>
                  </>
                ) : (
                  <div className="grid gap-4 rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 aria-hidden="true" className="mt-0.5 text-[color:var(--dl-forest)]" size={20} />
                      <div className="grid gap-2">
                        <p className="text-base font-semibold text-[color:var(--dl-forest)]">
                          Pool dah dikunci. Combined cap: {formatCurrency(pool.combinedCapCents ?? 0)}.
                          {" "}Cadangkan barang.
                        </p>
                        <p className="text-sm text-[color:var(--dl-forest)]">
                          Frontend Phase 2 berhenti di sini. Butang di bawah sengaja letak sebagai jambatan ke Phase 3.
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      variant="secondary"
                      size="lg"
                      onClick={() => toast.message("Phase 3 suggestion flow belum disambung lagi.")}
                    >
                      <Sparkles aria-hidden="true" size={18} />
                      Cadangkan barang
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 text-sm text-[color:var(--dl-slate)]">
                  <UsersRound aria-hidden="true" size={18} />
                  Refresh automatik setiap 2 saat membantu anda nampak ahli baharu tanpa reload manual.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
