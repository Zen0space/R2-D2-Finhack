"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, KeyRound, Landmark, MapPinned, ShieldCheck, WalletCards } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { BrushHeadline, Logo, ScribbleCircle } from "@/components/duitlater/brand/zine";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatErrorMessage } from "@/lib/api/errors";
import {
  authClient,
  API_BASE,
  DEMO_ACCOUNTS,
  DEMO_CREDENTIALS,
  requestRegistrationCode,
  verifyRegistrationCode,
} from "@/lib/auth/client";
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
    verificationCode: z.string().optional(),
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
    <Card className="relative h-full overflow-hidden">
      <ScribbleCircle
        color="brick"
        size={260}
        variant="loop"
        className="-right-12 -top-10 opacity-15"
      />
      <CardHeader className="relative gap-4 border-b border-[color:rgba(31,31,26,0.1)]">
        <Badge tone="gold">Phase 1 frontend</Badge>
        <div className="grid gap-3">
          <BrushHeadline color="brick" size="xl" rotate={-2} as="h2">
            {pageCopy[mode].title}
          </BrushHeadline>
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
      if (result.error) throw new Error(result.error.message ?? "Email or password is incorrect.");
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      toast.success(pageCopy["sign-in"].toast);
      startTransition(() => router.push(nextPath));
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Couldn't sign in right now."));
    },
  });

  return (
    <Card>
      <CardHeader className="gap-3 border-b border-[color:rgba(31,31,26,0.1)]">
        <Badge tone="maroon">Sign in</Badge>
        <div className="grid gap-2">
          <BrushHeadline color="teal" size="lg" rotate={-2}>
            Daftar masuk
          </BrushHeadline>
          <CardDescription>
            Session akan disimpan pada browser ini supaya reload tak buang allowance view kau.
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
  const [codeSent, setCodeSent] = useState(false);
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      kampungName: "Felda Gedangsa",
      email: "",
      verificationCode: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: SignUpFormValues) => {
      if (!codeSent) {
        await requestRegistrationCode({
          email: values.email,
          name: values.name,
        });

        return { stage: "code-sent" as const };
      }

      const code = values.verificationCode?.trim();
      if (!code) {
        throw new Error("Masukkan kod pengesahan 6 digit yang dihantar ke e-mel anda.");
      }

      await verifyRegistrationCode({
        email: values.email,
        code,
      });

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
      if (result.error) throw new Error(result.error.message ?? "Couldn't create the account.");
      return { stage: "signed-up" as const };
    },
    onSuccess: async (result) => {
      if (result.stage === "code-sent") {
        setCodeSent(true);
        toast.success("Kod pengesahan sudah dihantar. Semak e-mel anda.");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      toast.success(pageCopy["sign-up"].toast);
      startTransition(() => router.push(nextPath));
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Couldn't create the account right now."));
    },
  });

  return (
    <Card>
      <CardHeader className="gap-3 border-b border-[color:rgba(31,31,26,0.1)]">
        <Badge tone="maroon">Sign up</Badge>
        <div className="grid gap-2">
          <BrushHeadline color="teal" size="lg" rotate={-2}>
            Buka akaun baharu
          </BrushHeadline>
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
              disabled={codeSent || mutation.isPending}
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
              disabled={codeSent || mutation.isPending}
              id="sign-up-kampung"
              placeholder="Contoh: Felda Gedangsa"
              {...form.register("kampungName")}
            />
          </Field>

          <Field error={form.formState.errors.email?.message} htmlFor="sign-up-email" label="E-mel" required>
            <Input
              aria-invalid={Boolean(form.formState.errors.email)}
              autoComplete="email"
              disabled={codeSent || mutation.isPending}
              id="sign-up-email"
              placeholder="nama@contoh.my"
              {...form.register("email")}
            />
          </Field>

          {codeSent ? (
            <Field
              error={form.formState.errors.verificationCode?.message}
              htmlFor="sign-up-verification-code"
              label="Kod pengesahan e-mel"
              required
            >
              <Input
                aria-invalid={Boolean(form.formState.errors.verificationCode)}
                autoComplete="one-time-code"
                id="sign-up-verification-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="6 digit"
                {...form.register("verificationCode")}
              />
              <button
                className="mt-2 text-left text-sm font-semibold text-[color:var(--dl-maroon)] underline-offset-4 hover:underline"
                disabled={mutation.isPending}
                type="button"
                onClick={() => {
                  setCodeSent(false);
                  form.setValue("verificationCode", "");
                }}
              >
                Tukar e-mel atau hantar semula kod
              </button>
            </Field>
          ) : null}

          <Field
            error={form.formState.errors.password?.message}
            htmlFor="sign-up-password"
            label="Kata laluan"
            required
          >
            <Input
              aria-invalid={Boolean(form.formState.errors.password)}
              autoComplete="new-password"
              disabled={codeSent || mutation.isPending}
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
              disabled={codeSent || mutation.isPending}
              id="sign-up-confirm-password"
              placeholder="Ulang kata laluan"
              type="password"
              {...form.register("confirmPassword")}
            />
          </Field>

          <Button className="mt-2 w-full" size="lg" type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? codeSent
                ? "Sedang sahkan..."
                : "Sedang hantar kod..."
              : codeSent
                ? "Sahkan kod dan cipta akaun"
                : "Hantar kod pengesahan"}
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
      <div className="page-shell grid gap-6">
        <Link href="/" className="inline-flex w-fit">
          <Logo width={150} priority />
        </Link>
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <AuthStory mode={mode} />
          <div className="grid gap-4">
            {children}
            <Link
              className={cn(buttonVariants({ variant: "ghost" }), "justify-start px-4")}
              href="/"
            >
              Kembali ke ringkasan Phase 1
            </Link>
          </div>
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
