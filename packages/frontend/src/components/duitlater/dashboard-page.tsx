"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LogOut, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSessionQuery } from "@/hooks/use-session-query";
import { authClient } from "@/lib/auth/client";
import { cn, formatCurrency } from "@/lib/utils";

const checklist = [
  "Nama member + kampung dipulihkan terus dari session.",
  "Allowance PayLater individu dipaparkan besar guna JetBrains Mono.",
  "State kosong pool ikut copy plan: Belum ada pool. Cipta atau sertai.",
] as const;

export function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isLoading } = useSessionQuery();

  const signOutMutation = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(["auth", "session"], null);
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
                Untuk Phase 1, anda perlu daftar masuk dulu supaya allowance dan profil kampung boleh
                dipulihkan dengan betul.
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
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <main className="px-4 py-6 sm:px-6 lg:py-10">
      <div className="page-shell grid gap-6">
        <header className="panel-surface rounded-[2.25rem] px-6 py-7 md:px-8 md:py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="grid gap-4">
              <div className="flex flex-wrap gap-3">
                <Badge tone="gold">Dashboard</Badge>
                <Badge tone="forest">Sesi demo lokal</Badge>
              </div>
              <div className="grid gap-3">
                <h1 className="text-5xl sm:text-6xl">Selamat datang, {firstName}.</h1>
                <p className="max-w-2xl text-base text-[color:var(--dl-slate)] sm:text-lg">
                  Profil anda dah aktif untuk Phase 1. Sekarang allowance individu dan konteks kampung
                  boleh disemak sebelum masuk ke pool creation dalam fasa seterusnya.
                </p>
              </div>
            </div>

            <Button
              className="w-full lg:w-auto"
              variant="outline"
              size="default"
              onClick={() => signOutMutation.mutate()}
              disabled={signOutMutation.isPending}
            >
              <LogOut aria-hidden="true" size={16} />
              {signOutMutation.isPending ? "Sedang keluar..." : "Sign out"}
            </Button>
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
                  Allowance individu seeded untuk demo member ini.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 py-6">
                <p className="data-figure text-5xl font-semibold tracking-[-0.08em] sm:text-6xl">
                  {formatCurrency(user.individualPayLaterAllowanceCents)}
                </p>
                <p className="max-w-xl text-sm text-white/78 sm:text-base">
                  Nilai ini akan jadi komponen asas bila pool dah locked nanti. Buat masa ini, ia
                  dipaparkan solo seperti yang diminta dalam Phase 1.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/14 bg-black/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      Kampung
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">{user.kampung.name}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/14 bg-black/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      Peranan
                    </p>
                    <p className="mt-2 text-lg font-semibold capitalize text-white">{user.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-3">
                <Badge tone="maroon">Pool state</Badge>
                <CardTitle className="text-4xl">Belum ada pool.</CardTitle>
                <CardDescription className="text-base">
                  Cipta atau sertai. Itu masuk dalam skop Phase 2, jadi Phase 1 sengaja berhenti di
                  sini dengan empty state yang jelas.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="rounded-[1.5rem] border border-dashed border-[color:rgba(122,46,46,0.18)] bg-[color:rgba(122,46,46,0.04)] p-4 text-sm text-[color:var(--dl-slate)]">
                  Bila backend dan Phase 2 siap, ruang ini akan tunjuk senarai pool yang anda cipta
                  atau sertai.
                </div>
                <Link className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between")} href="/">
                  Lihat ringkasan Phase 1
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </CardContent>
            </Card>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader className="gap-3">
              <Badge tone="forest">Profil</Badge>
              <CardTitle className="text-4xl">Ringkasan ahli</CardTitle>
              <CardDescription className="text-base">
                Dashboard Phase 1 tunjuk siapa ahli itu dan kampung mana yang dia bawa masuk.
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
                  Daerah
                </p>
                <p className="mt-2 text-lg">
                  {user.kampung.district}, {user.kampung.state}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-3">
              <Badge tone="gold">Apa yang siap</Badge>
              <CardTitle className="text-4xl">Phase 1 checklist</CardTitle>
              <CardDescription className="text-base">
                Ini yang perlu benar untuk claim frontend Phase 1 dah mula bergerak dengan betul.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {checklist.map((item) => (
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

              <div className="mt-2 flex flex-wrap gap-3">
                <Link className={cn(buttonVariants({ variant: "outline" }))} href="/sign-up">
                  Uji flow sign-up
                </Link>
                <Link className={cn(buttonVariants({ variant: "ghost" }))} href="/sign-in">
                  Uji flow sign-in lain
                </Link>
              </div>

              <div className="flex items-center gap-3 rounded-[1.5rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-4 text-sm text-[color:var(--dl-forest)]">
                <UsersRound aria-hidden="true" size={18} />
                Session ini akan kekal walaupun page reload, selagi local browser storage tak dibuang.
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
