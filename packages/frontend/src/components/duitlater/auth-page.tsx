"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, KeyRound, Landmark, MapPinned, ShieldCheck, WalletCards } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatErrorMessage } from "@/lib/api/errors";
import { authClient, API_BASE, DEMO_ACCOUNTS, DEMO_CREDENTIALS } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import type { SignInInput } from "@/types/auth";

type AuthMode = "sign-in" | "sign-up";

const signInSchema = z.object({
  email: z.string().email("Masukkan e-mel yang sah."),
  password: z.string().min(8, "Kata laluan minimum 8 aksara."),
});

const signUpSchema = signInSchema
  .extend({
    name: z.string().min(2, "Nama minimum 2 huruf."),
    kampungName: z.string().min(2, "Masukkan nama kampung."),
    confirmPassword: z.string().min(8, "Ulang kata laluan anda."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Kata laluan tak sama.",
    path: ["confirmPassword"],
  });

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

const storyPoints = [
  {
    title: "Sesi kekal selepas reload",
    body: "Better Auth simpan session pada browser ini supaya dashboard terus pulih bila anda buka semula.",
    icon: ShieldCheck,
  },
  {
    title: "Allowance jelas",
    body: "Lepas auth, member terus nampak allowance PayLater individu dalam format besar dan mudah scan.",
    icon: WalletCards,
  },
  {
    title: "Kampung-aware",
    body: "Nama kampung masuk dalam profil awal supaya Phase 2 pool nanti dah ada konteks komuniti.",
    icon: MapPinned,
  },
] as const;

const pageCopy = {
  "sign-in": {
    title: "Masuk semula. Tengok allowance anda.",
    description:
      "Phase 1 bagi flow paling ringkas dulu: auth, session restore, dan dashboard allowance individu.",
    ctaLabel: "Masuk ke dashboard",
    alternateHref: "/sign-up",
    alternateLabel: "Belum ada akaun? Cipta di sini",
    toast: "Sesi berjaya dipulihkan. Allowance anda dah sedia.",
  },
  "sign-up": {
    title: "Cipta akaun dulu, baru boleh pool ramai-ramai.",
    description:
      "Daftar member dengan nama, kampung, dan e-mel. Sistem terus bina profil awal untuk allowance view Phase 1.",
    ctaLabel: "Cipta akaun",
    alternateHref: "/sign-in",
    alternateLabel: "Dah ada akaun? Sign in di sini",
    toast: "Akaun siap. Selamat datang ke dashboard anda.",
  },
} as const;

function resolveNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function AuthStory({ mode }: { mode: AuthMode }) {
  return (
    <Card className="h-full">
      <CardHeader className="gap-4 border-b border-[color:rgba(224,216,200,0.72)]">
        <Badge tone="gold">Phase 1 frontend</Badge>
        <div className="grid gap-3">
          <CardTitle className="text-5xl sm:text-6xl">{pageCopy[mode].title}</CardTitle>
          <CardDescription className="max-w-xl text-base">
            {pageCopy[mode].description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 py-6">
        <div className="grid gap-4">
          {storyPoints.map((point) => {
            const Icon = point.icon;

            return (
              <div
                className="grid gap-2 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.7)] p-4"
                key={point.title}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:rgba(200,148,31,0.14)] text-[color:var(--dl-gold-dark)]">
                    <Icon aria-hidden="true" size={18} />
                  </div>
                  <strong className="text-base">{point.title}</strong>
                </div>
                <p className="text-sm text-[color:var(--dl-slate)]">{point.body}</p>
              </div>
            );
          })}
        </div>

        {mode === "sign-in" ? (
          <div className="rounded-[1.5rem] border border-[color:rgba(122,46,46,0.14)] bg-[color:rgba(122,46,46,0.05)] p-4">
            <div className="flex items-center gap-3 text-[color:var(--dl-maroon)]">
              <KeyRound aria-hidden="true" size={18} />
              <strong className="text-sm uppercase tracking-[0.16em]">Demo access</strong>
            </div>
            <p className="mt-3 text-sm text-[color:var(--dl-slate)]">
              Guna akaun demo backend ini untuk cepat semak flow ahli atau portal NADI tanpa perlu cipta pengguna baharu dahulu.
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              {DEMO_ACCOUNTS.map((account) => (
                <div className="grid gap-2 rounded-[1rem] bg-white/82 p-3" key={account.email}>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{account.name}</strong>
                    <Badge tone={account.role === "nadi_staff" ? "maroon" : "gold"}>
                      {account.role === "nadi_staff" ? "NADI staff" : "Ahli"}
                    </Badge>
                  </div>
                  <code>{account.email}</code>
                  <code>{account.password}</code>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grain-line" />

        <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--dl-slate)]">
          <Landmark aria-hidden="true" size={16} />
          <span>BM-first copy · Better Auth hidup · akaun demo seeded untuk terus uji flow.</span>
        </div>
      </CardContent>
    </Card>
  );
}

function SignInFormCard({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: {
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: SignInInput) => {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
      if (result.error) throw new Error(result.error.message ?? "E-mel atau kata laluan tak padan.");
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      toast.success(pageCopy["sign-in"].toast);
      startTransition(() => router.push(nextPath));
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Tak dapat masuk sekarang."));
    },
  });

  return (
    <Card>
      <CardHeader className="gap-3 border-b border-[color:rgba(224,216,200,0.72)]">
        <Badge tone="maroon">Sign in</Badge>
        <div className="grid gap-2">
          <CardTitle>Daftar masuk</CardTitle>
          <CardDescription>
            Session akan disimpan pada browser ini supaya reload tak buang allowance view anda.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 py-6">
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Field error={form.formState.errors.email?.message} htmlFor="sign-in-email" label="E-mel" required>
            <Input
              aria-invalid={Boolean(form.formState.errors.email)}
              autoComplete="email"
              id="sign-in-email"
              placeholder="nama@contoh.my"
              {...form.register("email")}
            />
          </Field>

          <Field
            error={form.formState.errors.password?.message}
            htmlFor="sign-in-password"
            label="Kata laluan"
            required
          >
            <Input
              aria-invalid={Boolean(form.formState.errors.password)}
              autoComplete="current-password"
              id="sign-in-password"
              placeholder="Minimum 8 aksara"
              type="password"
              {...form.register("password")}
            />
          </Field>

          <Button className="mt-2 w-full" size="lg" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Sedang masuk..." : pageCopy["sign-in"].ctaLabel}
            <ArrowRight aria-hidden="true" size={18} />
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link className="font-semibold text-[color:var(--dl-maroon)]" href={pageCopy["sign-in"].alternateHref}>
            {pageCopy["sign-in"].alternateLabel}
          </Link>
          <Link className="text-[color:var(--dl-slate)] underline-offset-4 hover:underline" href="/">
            Kembali ke utama
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function SignUpFormCard({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      kampungName: "Felda Gedangsa",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: SignUpFormValues) => {
      // Resolve kampungId from name — default to Felda Gedangsa if not found
      const kampungRes = await fetch(
        `${API_BASE}/api/v1/kampungs?q=${encodeURIComponent(values.kampungName)}&limit=1`,
      );
      const kampungBody = (await kampungRes.json()) as {
        data?: { kampungs?: { id: string }[] };
      };
      const kampungId =
        kampungBody?.data?.kampungs?.[0]?.id ?? "cmoekukcx000i3ygufgjh8q08";

      // kampungId is an additionalField on the server — cast needed until
      // inferAdditionalFields plugin is configured on the client.
      const result = await (authClient.signUp.email as unknown as (
        opts: Record<string, unknown>,
      ) => Promise<{ error: { message?: string } | null }>)({
        email: values.email,
        password: values.password,
        name: values.name,
        kampungId,
      });
      if (result.error) throw new Error(result.error.message ?? "Tak dapat cipta akaun.");
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      toast.success(pageCopy["sign-up"].toast);
      startTransition(() => router.push(nextPath));
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Tak dapat cipta akaun sekarang."));
    },
  });

  return (
    <Card>
      <CardHeader className="gap-3 border-b border-[color:rgba(224,216,200,0.72)]">
        <Badge tone="maroon">Sign up</Badge>
        <div className="grid gap-2">
          <CardTitle>Buka akaun baharu</CardTitle>
          <CardDescription>
            Nama kampung dikumpul sekarang supaya dashboard dan Phase 2 pool flow ada konteks dari awal.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 py-6">
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <Field error={form.formState.errors.name?.message} htmlFor="sign-up-name" label="Nama penuh" required>
            <Input
              aria-invalid={Boolean(form.formState.errors.name)}
              autoComplete="name"
              id="sign-up-name"
              placeholder="Contoh: Nurul Aisyah"
              {...form.register("name")}
            />
          </Field>

          <Field
            error={form.formState.errors.kampungName?.message}
            htmlFor="sign-up-kampung"
            label="Kampung"
            required
          >
            <Input
              aria-invalid={Boolean(form.formState.errors.kampungName)}
              autoComplete="address-level2"
              id="sign-up-kampung"
              placeholder="Contoh: Felda Gedangsa"
              {...form.register("kampungName")}
            />
          </Field>

          <Field error={form.formState.errors.email?.message} htmlFor="sign-up-email" label="E-mel" required>
            <Input
              aria-invalid={Boolean(form.formState.errors.email)}
              autoComplete="email"
              id="sign-up-email"
              placeholder="nama@contoh.my"
              {...form.register("email")}
            />
          </Field>

          <Field
            error={form.formState.errors.password?.message}
            htmlFor="sign-up-password"
            label="Kata laluan"
            required
          >
            <Input
              aria-invalid={Boolean(form.formState.errors.password)}
              autoComplete="new-password"
              id="sign-up-password"
              placeholder="Minimum 8 aksara"
              type="password"
              {...form.register("password")}
            />
          </Field>

          <Field
            error={form.formState.errors.confirmPassword?.message}
            htmlFor="sign-up-confirm-password"
            label="Ulang kata laluan"
            required
          >
            <Input
              aria-invalid={Boolean(form.formState.errors.confirmPassword)}
              autoComplete="new-password"
              id="sign-up-confirm-password"
              placeholder="Ulang kata laluan"
              type="password"
              {...form.register("confirmPassword")}
            />
          </Field>

          <Button className="mt-2 w-full" size="lg" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Sedang cipta..." : pageCopy["sign-up"].ctaLabel}
            <ArrowRight aria-hidden="true" size={18} />
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link className="font-semibold text-[color:var(--dl-maroon)]" href={pageCopy["sign-up"].alternateHref}>
            {pageCopy["sign-up"].alternateLabel}
          </Link>
          <Link className="text-[color:var(--dl-slate)] underline-offset-4 hover:underline" href="/">
            Kembali ke utama
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function AuthLayout({ children, mode }: { children: ReactNode; mode: AuthMode }) {
  return (
    <main className="px-4 py-6 sm:px-6 lg:py-10">
      <div className="page-shell grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <AuthStory mode={mode} />
        <div className="grid gap-4">
          {children}
          <Link
            className={cn(buttonVariants({ variant: "ghost" }), "justify-start rounded-[1.5rem] px-4")}
            href="/"
          >
            Kembali ke ringkasan Phase 1
          </Link>
        </div>
      </div>
    </main>
  );
}

export function SignInPage({ nextPath }: { nextPath: string | null }) {
  return (
    <AuthLayout mode="sign-in">
      <SignInFormCard nextPath={resolveNextPath(nextPath)} />
    </AuthLayout>
  );
}

export function SignUpPage({ nextPath }: { nextPath: string | null }) {
  return (
    <AuthLayout mode="sign-up">
      <SignUpFormCard nextPath={resolveNextPath(nextPath)} />
    </AuthLayout>
  );
}
