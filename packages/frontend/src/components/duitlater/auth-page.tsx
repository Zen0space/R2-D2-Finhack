"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { BrushHeadline, TornCard, ZineSection } from "@/components/duitlater/brand/zine";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatErrorMessage } from "@/lib/api/errors";
import {
  authClient,
  API_BASE,
  DEMO_ACCOUNTS,
  DEMO_CREDENTIALS,
} from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import type { SignInInput } from "@/types/auth";

type AuthMode = "sign-in" | "sign-up";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const tryNowSchema = z.object({
  name: z.string().min(2, "Enter at least 2 characters."),
});

type SignInFormValues = z.infer<typeof signInSchema>;
type TryNowFormValues = z.infer<typeof tryNowSchema>;

const pageCopy = {
  "sign-in": {
    eyebrow: "Welcome back",
    title: "Sign in",
    tagline: "Resume your pool. Check allowance.",
    ctaLabel: "Sign in",
    ctaPending: "Signing in...",
    toast: "Session restored. Your allowance is ready.",
  },
  "sign-up": {
    eyebrow: "Try DuitLater",
    title: "Try Now",
    tagline: "Enter your name. Form a pool. Invite neighbours.",
    ctaLabel: "Try Now",
    ctaPending: "Creating your pool...",
    toast: "You're in. Form a pool and invite neighbours.",
  },
} as const;

const zineButtonClass = cn(
  buttonVariants({ size: "lg" }),
  "zine-display w-full justify-center !bg-[var(--dl-zine-paper)] !text-[var(--dl-zine-brick)] hover:!bg-[var(--dl-zine-paper-warm)]",
);

const zineButtonShadow = { boxShadow: "5px 5px 0 var(--dl-zine-brick-dark)" } as const;

function resolveNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

function AuthShell({
  mode,
  children,
}: {
  mode: AuthMode;
  children: React.ReactNode;
}) {
  const copy = pageCopy[mode];

  return (
    <main className="zine-paper min-h-screen">
      <ZineSection color="brick" className="px-4 pb-24 pt-10 md:pb-32 md:pt-14">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
          <Link
            href="/"
            className="zine-display self-center text-[10px] uppercase tracking-[0.28em] text-[var(--dl-zine-paper)] underline-offset-4 hover:underline md:text-xs"
          >
            ← Back to home
          </Link>

          <span
            className="zine-display mt-12 inline-block border-2 border-[var(--dl-zine-paper)] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[var(--dl-zine-paper)] md:mt-16 md:text-xs"
            style={{ boxShadow: "3px 3px 0 var(--dl-zine-brick-dark)" }}
          >
            {copy.eyebrow}
          </span>

          <h1 className="mt-8">
            <BrushHeadline color="paper" size="2xl" rotate={-2} as="span">
              {copy.title}
            </BrushHeadline>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--dl-zine-paper)] md:text-lg">
            {copy.tagline}
          </p>

          <div className="mt-12 grid w-full max-w-md gap-6 md:mt-14">
            {children}
          </div>
        </div>
      </ZineSection>
    </main>
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
    <TornCard rotate="none" bg="paper" torn={false} className="!p-6 md:!p-8">
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <Field error={form.formState.errors.email?.message} htmlFor="sign-in-email" label="Email" required>
          <Input
            aria-invalid={Boolean(form.formState.errors.email)}
            autoComplete="email"
            id="sign-in-email"
            placeholder="name@example.com"
            {...form.register("email")}
          />
        </Field>

        <Field
          error={form.formState.errors.password?.message}
          htmlFor="sign-in-password"
          label="Password"
          required
        >
          <Input
            aria-invalid={Boolean(form.formState.errors.password)}
            autoComplete="current-password"
            id="sign-in-password"
            placeholder="At least 8 characters"
            type="password"
            {...form.register("password")}
          />
        </Field>

        <button
          className={zineButtonClass}
          style={zineButtonShadow}
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? pageCopy["sign-in"].ctaPending : pageCopy["sign-in"].ctaLabel}
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      </form>

      <div className="mt-6 border-t-2 border-dashed border-[color:rgba(31,31,26,0.2)] pt-4 text-center">
        <Link
          className="zine-display text-xs uppercase tracking-[0.18em] text-[var(--dl-zine-brick)] underline-offset-4 hover:underline"
          href="/sign-up"
        >
          New here? Try Now
        </Link>
      </div>
    </TornCard>
  );
}

function DemoAccountsPanel() {
  return (
    <TornCard rotate="r" bg="cream" className="!p-5">
      <p className="zine-display text-xs uppercase tracking-[0.22em] text-[var(--dl-zine-brick)]">
        Demo access · seeded
      </p>
      <p className="mt-2 text-sm text-[var(--dl-slate)]">
        Walk the member or NADI flow without registering. Tap an account to copy the email.
      </p>
      <div className="mt-4 grid gap-2 text-sm">
        {DEMO_ACCOUNTS.map((account) => (
          <div className="grid gap-1 rounded-md bg-white/70 p-3" key={account.email}>
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-[var(--dl-zine-ink)]">{account.name}</strong>
              <Badge tone={account.role === "nadi_staff" ? "maroon" : "gold"}>
                {account.role === "nadi_staff" ? "NADI staff" : "Member"}
              </Badge>
            </div>
            <code className="text-xs">{account.email}</code>
            <code className="text-xs">{account.password}</code>
          </div>
        ))}
      </div>
    </TornCard>
  );
}

const DEFAULT_KAMPUNG_FALLBACK_ID = "cmoejhqhj000iqlstfjemg1h1";

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function TryNowFormCard({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<TryNowFormValues>({
    resolver: zodResolver(tryNowSchema),
    mode: "onBlur",
    defaultValues: { name: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: TryNowFormValues) => {
      const kampungRes = await fetch(
        `${API_BASE}/api/v1/kampungs?q=Felda%20Gedangsa&limit=1`,
      );
      const kampungBody = (await kampungRes.json()) as {
        data?: { kampungs?: { id: string }[] };
      };
      const kampungId =
        kampungBody?.data?.kampungs?.[0]?.id ?? DEFAULT_KAMPUNG_FALLBACK_ID;

      const handle = randomHex(6);
      const email = `try-${handle}@duitlater.local`;
      const password = randomHex(16);

      const result = await (authClient.signUp.email as unknown as (
        opts: Record<string, unknown>,
      ) => Promise<{ error: { message?: string } | null }>)({
        email,
        password,
        name: values.name,
        kampungId,
      });
      if (result.error) throw new Error(result.error.message ?? "Couldn't create your account.");
      return { stage: "signed-up" as const };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      toast.success(pageCopy["sign-up"].toast);
      startTransition(() => router.push(nextPath));
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Couldn't start your session right now."));
    },
  });

  return (
    <TornCard rotate="none" bg="paper" torn={false} className="!p-6 md:!p-8">
      <form
        className="grid gap-5"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <Field
          error={form.formState.errors.name?.message}
          htmlFor="try-name"
          label="Your name"
          required
        >
          <Input
            aria-invalid={Boolean(form.formState.errors.name)}
            autoComplete="name"
            disabled={mutation.isPending}
            id="try-name"
            placeholder="e.g. Aisyah"
            {...form.register("name")}
          />
        </Field>

        <button
          className={zineButtonClass}
          style={zineButtonShadow}
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? pageCopy["sign-up"].ctaPending : pageCopy["sign-up"].ctaLabel}
          <ArrowRight aria-hidden="true" size={18} />
        </button>

        <p className="text-center text-xs text-[var(--dl-slate)]">
          No email, no password. Just your name. You can invite neighbours after.
        </p>
      </form>
    </TornCard>
  );
}

export function SignInPage({ nextPath }: { nextPath: string | null }) {
  return (
    <AuthShell mode="sign-in">
      <SignInFormCard nextPath={resolveNextPath(nextPath)} />
      <DemoAccountsPanel />
    </AuthShell>
  );
}

export function SignUpPage({ nextPath }: { nextPath: string | null }) {
  return (
    <AuthShell mode="sign-up">
      <TryNowFormCard nextPath={resolveNextPath(nextPath)} />
    </AuthShell>
  );
}
