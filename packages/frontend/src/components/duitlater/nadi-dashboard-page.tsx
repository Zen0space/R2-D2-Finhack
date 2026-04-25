"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Truck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatErrorMessage } from "@/lib/api/errors";
import { useNadiPoolsQuery } from "@/hooks/use-pools-query";
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

export function NadiDashboardPage() {
  const queryClient = useQueryClient();
  const { data: session, isLoading: isSessionLoading } = useSessionQuery();
  const poolsQuery = useNadiPoolsQuery(session?.user ?? null);

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
                  Halaman ini hanya paparkan ringkasan pool di peringkat kampung. Tiada jumlah individu
                  sensitif dipaparkan selain bilangan ahli dan status penghantaran.
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
