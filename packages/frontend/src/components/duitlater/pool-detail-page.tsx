"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InviteQr } from "@/components/duitlater/invite-qr";
import { PoolSuggestionsPanel } from "@/components/duitlater/pool-suggestions-panel";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoolDetailQuery } from "@/hooks/use-pools-query";
import { useSessionQuery } from "@/hooks/use-session-query";
import { poolsClient } from "@/lib/pools/client";
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
import type { PoolSuggestionFilter, PoolVoteChoice } from "@/types/pool";

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

function formatDateTime(value: string | null) {
  if (!value) {
    return "Belum direkod";
  }

  return new Intl.DateTimeFormat("ms-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PoolDetailPage({ poolId }: PoolDetailPageProps) {
  const queryClient = useQueryClient();
  const [lastVotePromptKey, setLastVotePromptKey] = useState<string | null>(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [pendingFilter, setPendingFilter] = useState<PoolSuggestionFilter | null>(null);
  const [pendingSuggestionId, setPendingSuggestionId] = useState<string | null>(null);
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

  const suggestMutation = useMutation({
    mutationFn: (filter: PoolSuggestionFilter) => poolsClient.suggest(poolId, filter),
    onMutate: (filter) => {
      setPendingFilter(filter);
    },
    onSuccess: (updatedPool) => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      queryClient.setQueryData(["pools", "detail", poolId], updatedPool);
      toast.success("Penasihat dah susun shortlist BM untuk pool ini.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Tak dapat jana cadangan sekarang.");
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
      toast.success("Barang dipilih. Pool kini masuk ke fasa voting.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Tak dapat pilih barang sekarang.");
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
      setIsVoteModalOpen(false);
      toast.success(
        updatedPool.state === "approved"
          ? "Majoriti dicapai. Pool kini menunggu pengesahan dari NADI."
          : vote === "YES"
            ? "Undian setuju anda dah direkodkan."
            : "Undian tak setuju anda dah direkodkan.",
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Tak dapat simpan undian sekarang.");
    },
  });

  useEffect(() => {
    if (!session || !pool) {
      return;
    }

    const nextVotePromptKey = `${pool.id}:${pool.votingStartedAt ?? pool.selectedSuggestionId ?? "vote"}`;
    const hasVotePending = pool.state === "voting" && !getMemberVote(pool, session.user.id);

    if (pool.state !== "voting") {
      setIsVoteModalOpen(false);
      return;
    }

    if (!hasVotePending || lastVotePromptKey === nextVotePromptKey) {
      return;
    }

    setIsVoteModalOpen(true);
    setLastVotePromptKey(nextVotePromptKey);
  }, [lastVotePromptKey, pool, session]);

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
  const selectedSuggestion = getSelectedSuggestion(pool);
  const activeSuggestionFilter = pendingFilter ?? pool.suggestionFilter;
  const catalogueMatchCount = countCatalogueMatches(pool, activeSuggestionFilter);
  const currentUserVote = getMemberVote(pool, session.user.id);
  const votingState = buildVotingState(pool);
  const currentUserShare = getMemberSharePreview(pool, session.user.id);
  const sharePreviewByUserId = new Map(
    pool.members.map((member) => [member.userId, getMemberSharePreview(pool, member.userId)]),
  );
  const canVoteNow = pool.state === "voting" && !currentUserVote;
  const awaitingNadi = pool.state === "approved" && pool.transaction;

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
                <Badge tone="forest">
                  {pool.state === "approved" || pool.state === "active" ? "Phase 4 live" : "Auto refresh 2s"}
                </Badge>
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
                {pool.state === "voting"
                  ? "Barang sudah dipilih dan undian ahli kini dibuka. Bila majoriti setuju, pool terus masuk ke state approved dan menunggu pengesahan NADI."
                  : pool.state === "approved"
                    ? "Majoriti sudah dicapai. Ringkasan transaksi kini dikunci sementara staf NADI sahkan penghantaran."
                    : pool.state === "active"
                      ? "Penghantaran sudah disahkan oleh NADI. Pool ini kini aktif dengan rekod transaksi yang sama untuk semua ahli."
                  : pool.state === "suggesting"
                    ? "5 cadangan BM-first kini tersedia di bawah. Anda boleh tapis ikut kategori sebelum pilih satu untuk dibawa ke voting."
                    : pool.state === "locked"
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
                <Badge
                  tone={
                    pool.state === "draft"
                      ? "maroon"
                      : pool.state === "voting"
                        ? "forest"
                        : pool.state === "approved" || pool.state === "active"
                          ? "forest"
                          : "gold"
                  }
                >
                  {pool.state === "draft"
                    ? "Lock pool"
                    : pool.state === "voting"
                      ? "Undian dibuka"
                      : pool.state === "approved"
                        ? "Menunggu NADI"
                        : pool.state === "active"
                          ? "Sudah disahkan"
                      : "Phase 3 aktif"}
                </Badge>
                <CardTitle className="text-4xl">
                  {pool.state === "draft"
                    ? "Bekukan roster ahli"
                    : pool.state === "voting"
                      ? "Undian ahli sedang berjalan"
                      : pool.state === "approved"
                        ? "Ringkasan transaksi dah siap"
                        : pool.state === "active"
                          ? "Pool dah bergerak ke active"
                      : "Katalog sedia untuk dipilih"}
                </CardTitle>
                <CardDescription className="text-base">
                  {pool.state === "draft"
                    ? "Hanya initiator boleh lock. Bila dikunci, senarai ahli dan combined cap jadi rasmi untuk langkah seterusnya."
                    : pool.state === "voting"
                      ? "Pilihan barang sudah ditetapkan. Ahli yang belum mengundi akan terus nampak modal undian pada kunjungan seterusnya."
                      : pool.state === "approved"
                        ? "Majoriti sudah dicapai. Sekarang hanya pengesahan penghantaran dari staf NADI diperlukan."
                        : pool.state === "active"
                          ? "Staf NADI telah sahkan penghantaran. Ringkasan transaksi kekal di bawah sebagai rekod visible kepada ahli pool."
                    : pool.state === "suggesting"
                      ? "Cadangan telah dijana. Tapis ikut kategori dan pilih satu barang dari panel di bawah."
                      : pool.state === "locked"
                    ? `Pool dah dikunci. Combined cap: ${formatCurrency(
                        pool.combinedCapCents ?? 0,
                      )}. Cadangkan barang.`
                      : "Pool ini sudah cukup syarat untuk mula menilai cadangan katalog."}
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
                ) : pool.state === "locked" ? (
                  <>
                    <div className="rounded-[1.5rem] border border-[color:rgba(200,148,31,0.22)] bg-[color:rgba(200,148,31,0.08)] p-4 text-sm text-[color:var(--dl-slate)]">
                      Klik `Cadangkan barang` untuk jana shortlist BM-first berasaskan cap pool, kategori
                      need, dan katalog MyKasih yang muat dalam bajet semasa.
                    </div>

                    <Button
                      className="w-full"
                      variant="secondary"
                      size="lg"
                      disabled={suggestMutation.isPending}
                      onClick={() => suggestMutation.mutate(pool.suggestionFilter)}
                    >
                      <Sparkles aria-hidden="true" size={18} />
                      {suggestMutation.isPending ? "Sedang jana..." : "Cadangkan barang"}
                    </Button>
                  </>
                ) : pool.state === "suggesting" ? (
                  <>
                    <div className="rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4 text-sm text-[color:var(--dl-forest)]">
                      5 cadangan sudah tersedia. Anda boleh tapis kategori atau jana semula shortlist jika
                      mahu fokus pada bahagian katalog tertentu.
                    </div>

                    <Button
                      className="w-full"
                      variant="secondary"
                      size="lg"
                      disabled={suggestMutation.isPending}
                      onClick={() => suggestMutation.mutate(pool.suggestionFilter)}
                    >
                      <Sparkles aria-hidden="true" size={18} />
                      {suggestMutation.isPending ? "Sedang jana semula..." : "Cadangkan semula"}
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
                              ? `${selectedSuggestion.nameBm} lulus undian dan kini tunggu pengesahan NADI.`
                              : pool.state === "active"
                                ? `${selectedSuggestion.nameBm} sudah disahkan untuk penghantaran pool ini.`
                                : `${selectedSuggestion.nameBm} telah dipilih untuk dibawa ke voting.`
                            : pool.state === "approved"
                              ? "Pool ini sudah diluluskan."
                              : "Pool ini sudah berada dalam voting."}
                        </p>
                        <p className="text-sm text-[color:var(--dl-forest)]">
                          {pool.state === "voting"
                            ? currentUserVote
                              ? `Undian anda direkodkan sebagai ${currentUserVote.vote === "YES" ? "Setuju" : "Tak setuju"}. Tally akan bergerak bila ahli lain hantar undian mereka.`
                              : "Undian anda masih belum direkodkan. Buka modal undian untuk semak share anda sebelum hantar keputusan."
                            : pool.state === "approved"
                              ? "Semua ahli kini melihat ringkasan transaksi yang sama sementara staf NADI buat pengesahan penghantaran."
                              : "Rekod pilihan ini kekal dipapar supaya semua ahli nampak konteks pembelian yang sama."}
                        </p>
                      </div>
                    </div>

                    {selectedSuggestion ? (
                      <div className="rounded-[1.25rem] bg-white/78 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                          Pilihan semasa
                        </p>
                        <p className="mt-2 text-lg font-semibold">{selectedSuggestion.nameBm}</p>
                        <p className="mt-1 text-sm text-[color:var(--dl-slate)]">
                          {formatCurrency(selectedSuggestion.priceCents)} · {selectedSuggestion.allocationPct}% cap pool
                        </p>
                      </div>
                    ) : null}

                    {pool.state === "voting" ? (
                      <Button
                        className="w-full"
                        disabled={!canVoteNow || voteMutation.isPending}
                        size="lg"
                        onClick={() => setIsVoteModalOpen(true)}
                      >
                        <Vote aria-hidden="true" size={18} />
                        {voteMutation.isPending
                          ? "Sedang hantar undian..."
                          : currentUserVote
                            ? "Undian sudah dihantar"
                            : "Buka undian"}
                      </Button>
                    ) : awaitingNadi && session.user.role === "nadi_staff" ? (
                      <Link
                        className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full")}
                        href="/nadi/dashboard"
                      >
                        <ShieldCheck aria-hidden="true" size={18} />
                        Buka portal NADI
                      </Link>
                    ) : null}
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

        {pool.state === "voting" || pool.state === "approved" || pool.state === "active" ? (
          <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <Card>
              <CardHeader className="gap-3">
                <Badge tone={pool.state === "voting" ? "forest" : "gold"}>
                  {pool.state === "voting" ? "Tally undian" : "Keputusan pool"}
                </Badge>
                <CardTitle className="text-4xl">
                  {pool.state === "voting" ? "Siapa dah setuju" : "Ringkasan selepas undian"}
                </CardTitle>
                <CardDescription className="text-base">
                  {pool.state === "voting"
                    ? "Tally ini bergerak bila ahli hantar undian. Majoriti mudah akan terus meluluskan pool."
                    : pool.state === "approved"
                      ? "Undian majoriti sudah dicapai. Langkah seterusnya ialah pengesahan penghantaran oleh staf NADI."
                      : "Undian sudah selesai dan penghantaran telah disahkan. Rekod ini kekal sebagai rujukan ahli pool."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-forest)]">
                      Setuju
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-[color:var(--dl-forest)]">
                      {votingState.yesCount}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[color:rgba(122,46,46,0.18)] bg-[color:rgba(122,46,46,0.06)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-maroon)]">
                      Tak setuju
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-[color:var(--dl-maroon)]">
                      {votingState.noCount}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Belum undi
                    </p>
                    <p className="mt-2 text-3xl font-semibold">
                      {votingState.pendingMemberIds.length}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/78 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                    Majoriti perlu
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {votingState.majorityThreshold} daripada {votingState.totalMembers} ahli
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--dl-slate)]">
                    {pool.state === "voting"
                      ? votingState.pendingMemberNames.length > 0
                        ? `Menunggu undian daripada ${votingState.pendingMemberNames.join(", ")}.`
                        : "Semua ahli sudah hantar keputusan untuk pusingan ini."
                      : pool.state === "approved"
                        ? "Undian cukup untuk lulus. Rekod share di sebelah telah dibekukan untuk pembelian ini."
                        : `NADI sahkan penghantaran pada ${formatDateTime(pool.deliveredAt)}.`}
                  </p>
                </div>

                {currentUserShare ? (
                  <div className="rounded-[1.5rem] border border-[color:rgba(200,148,31,0.22)] bg-[color:rgba(200,148,31,0.08)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-gold-dark)]">
                          Share anda
                        </p>
                        <p className="mt-2 text-2xl font-semibold">{formatCurrency(currentUserShare.shareAmountCents)}</p>
                      </div>
                      <Badge tone="gold">{currentUserShare.sharePct}% pool</Badge>
                    </div>
                    <p className="mt-3 text-sm text-[color:var(--dl-slate)]">
                      Anggaran bayaran bulanan anda ialah {formatCurrency(currentUserShare.monthlyAmountCents)} selama{" "}
                      {currentUserShare.totalCycles} bulan.
                    </p>
                    {currentUserVote ? (
                      <p className="mt-2 text-sm text-[color:var(--dl-forest)]">
                        Undian anda: {currentUserVote.vote === "YES" ? "Setuju" : "Tak setuju"} · dihantar{" "}
                        {formatDateTime(currentUserVote.votedAt)}
                      </p>
                    ) : pool.state === "voting" ? (
                      <p className="mt-2 text-sm text-[color:var(--dl-maroon)]">
                        Undian anda masih belum direkodkan untuk pool ini.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-3">
                <Badge tone={pool.state === "active" ? "forest" : "gold"}>
                  {pool.state === "voting" ? "Anggaran transaksi" : "Transaksi pool"}
                </Badge>
                <CardTitle className="text-4xl">
                  {pool.state === "voting" ? "Pecahan share sebelum lulus" : "Apa yang telah dikunci"}
                </CardTitle>
                <CardDescription className="text-base">
                  {pool.state === "voting"
                    ? "Setiap ahli nampak jumlah share yang sama sebelum buat keputusan supaya undian lebih jelas dan telus."
                    : pool.state === "approved"
                      ? "Transaksi ini kekal visible kepada semua ahli sementara menunggu pengesahan penghantaran."
                      : "Transaksi yang sama kekal dipapar selepas pengesahan untuk menunjukkan apa yang telah dibeli bersama."}
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
                        Harga pool
                      </p>
                      <p className="mt-2 text-lg font-semibold">{formatCurrency(selectedSuggestion.priceCents)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                        Status
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {pool.state === "voting"
                          ? "Menunggu majoriti"
                          : pool.state === "approved"
                            ? "Menunggu NADI"
                            : "Active"}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3">
                  {pool.members.map((member) => {
                    const share = sharePreviewByUserId.get(member.userId);

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
                            {member.userId === session.user.id ? <Badge tone="forest">Anda</Badge> : null}
                          </div>
                          <p className="mt-1 text-sm text-[color:var(--dl-slate)]">
                            Share {share.sharePct}% · allowance terkunci{" "}
                            {formatCurrency(member.individualAllowanceAtLockCents ?? member.individualAllowanceCents)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                            Jumlah share
                          </p>
                          <p className="mt-2 text-lg font-semibold">{formatCurrency(share.shareAmountCents)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                            Bulanan
                          </p>
                          <p className="mt-2 text-lg font-semibold">{formatCurrency(share.monthlyAmountCents)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {pool.transaction ? (
                  <div className="rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4 text-sm text-[color:var(--dl-forest)]">
                    Transaksi diluluskan pada {formatDateTime(pool.transaction.approvedAt)}.
                    {pool.transaction.deliveredAt
                      ? ` Penghantaran disahkan pada ${formatDateTime(pool.transaction.deliveredAt)}.`
                      : " Menunggu pengesahan penghantaran dari NADI."}
                  </div>
                ) : null}
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
                <Badge tone="forest">Undian ahli</Badge>
                <CardTitle className="text-4xl">Semak barang ini dulu sebelum undi.</CardTitle>
                <CardDescription className="text-base">
                  Semua ahli nampak item dan pecahan share yang sama supaya keputusan pool dibuat dengan jelas.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 py-6">
                <div className="grid gap-4 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Barang
                    </p>
                    <p className="mt-2 text-lg font-semibold">{selectedSuggestion.nameBm}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Harga
                    </p>
                    <p className="mt-2 text-lg font-semibold">{formatCurrency(selectedSuggestion.priceCents)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Allocation
                    </p>
                    <p className="mt-2 text-lg font-semibold">{selectedSuggestion.allocationPct}% cap pool</p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[color:rgba(200,148,31,0.22)] bg-[color:rgba(200,148,31,0.08)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-gold-dark)]">
                        Share anda
                      </p>
                      <p className="mt-2 text-3xl font-semibold">{formatCurrency(currentUserShare.shareAmountCents)}</p>
                    </div>
                    <Badge tone="gold">{currentUserShare.sharePct}% pool</Badge>
                  </div>
                  <p className="mt-3 text-sm text-[color:var(--dl-slate)]">
                    Anggaran bayaran bulanan anda ialah {formatCurrency(currentUserShare.monthlyAmountCents)} selama{" "}
                    {currentUserShare.totalCycles} bulan.
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
                    {voteMutation.isPending ? "Sedang hantar..." : "Setuju"}
                  </Button>
                  <Button
                    className="w-full"
                    disabled={voteMutation.isPending}
                    size="lg"
                    variant="outline"
                    onClick={() => voteMutation.mutate("NO")}
                  >
                    <Clock3 aria-hidden="true" size={18} />
                    {voteMutation.isPending ? "Sedang hantar..." : "Tak setuju"}
                  </Button>
                </div>

                <Button
                  className="w-full"
                  variant="ghost"
                  onClick={() => setIsVoteModalOpen(false)}
                >
                  Tutup dulu
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  );
}
