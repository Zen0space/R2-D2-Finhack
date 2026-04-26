"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ScrollText, UsersRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { formatErrorMessage } from "@/lib/api/errors";
import { BrushHeadline, NumberedTab, ScribbleCircle } from "@/components/duitlater/brand/zine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { poolsClient } from "@/lib/pools/client";
import { poolNeedCategories, type PoolNeedCategory } from "@/types/pool";
import type { MemberProfile } from "@/types/auth";

const poolSchema = z.object({
  name: z.string().trim().min(3, "Pool name must be at least 3 characters."),
  statedNeedCategory: z
    .string()
    .refine((value) => poolNeedCategories.some((category) => category.value === value), "Choose a category."),
  statedNeedText: z.string().trim().min(12, "Describe the pool need more clearly."),
  targetBudgetRm: z
    .string()
    .trim()
    .refine((value) => {
      const amount = Number(value);
      return Number.isFinite(amount) && amount >= 50;
    }, "Target budget must be at least RM 50."),
});

type PoolComposerValues = z.infer<typeof poolSchema>;

type PoolComposerModalProps = {
  currentUser: MemberProfile;
  isOpen: boolean;
  onClose: () => void;
};

export function PoolComposerModal({ currentUser, isOpen, onClose }: PoolComposerModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<PoolComposerValues>({
    resolver: zodResolver(poolSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      statedNeedCategory: "peralatan",
      statedNeedText: "",
      targetBudgetRm: "1200",
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: PoolComposerValues) =>
      poolsClient.create(
        {
          name: values.name,
          statedNeedCategory: values.statedNeedCategory as PoolNeedCategory,
          statedNeedText: values.statedNeedText,
          targetBudgetCents: Math.round(Number(values.targetBudgetRm) * 100),
        },
        currentUser,
      ),
    onSuccess: (pool) => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      toast.success("Pool created. Invite other members now.");
      form.reset();
      onClose();
      startTransition(() => router.push(`/pools/${pool.id}`));
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, "Couldn't create pool right now."));
    },
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(26,26,26,0.42)] px-4 py-6 backdrop-blur-sm sm:px-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="page-shell flex min-h-full items-center justify-center">
        <Card className="relative w-full max-w-3xl overflow-hidden">
          <ScribbleCircle
            color="brick"
            size={260}
            variant="loop"
            className="-right-12 -top-10 opacity-25"
          />
          <CardHeader className="relative gap-4 border-b border-[color:rgba(31,31,26,0.1)]">
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-4">
                <NumberedTab number={1} title="Form Pool" rotate={-1.5}>
                  At NADI centre · 1 of 4 in pool journey
                </NumberedTab>
                <div className="grid gap-2">
                  <BrushHeadline color="brick" size="xl" rotate={-2} as="h2">
                    Create a new pool
                  </BrushHeadline>
                  <p className="zine-display max-w-2xl text-sm tracking-[0.06em] text-[var(--dl-zine-ink)] md:text-base">
                    Fill in the name, need, category, and target budget. After this you go straight to the pool detail — invite members, lock the combined cap, then the Advisor suggests items.
                  </p>
                </div>
              </div>

              <Button aria-label="Close modal" variant="ghost" size="sm" onClick={onClose}>
                <X aria-hidden="true" size={18} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid gap-6 py-6 lg:grid-cols-[1.05fr_0.95fr]">
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
            >
              <Field error={form.formState.errors.name?.message} htmlFor="pool-name" label="Pool name" required>
                <Input
                  aria-invalid={Boolean(form.formState.errors.name)}
                  id="pool-name"
                  placeholder="e.g. Jahit Rezeki Gedangsa"
                  {...form.register("name")}
                />
              </Field>

              <Field
                error={form.formState.errors.statedNeedCategory?.message}
                htmlFor="pool-category"
                label="Need category"
                required
              >
                <Select
                  aria-invalid={Boolean(form.formState.errors.statedNeedCategory)}
                  id="pool-category"
                  {...form.register("statedNeedCategory")}
                >
                  {poolNeedCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                error={form.formState.errors.targetBudgetRm?.message}
                htmlFor="pool-budget"
                label="Target budget (RM)"
                required
              >
                <Input
                  aria-invalid={Boolean(form.formState.errors.targetBudgetRm)}
                  id="pool-budget"
                  inputMode="decimal"
                  placeholder="1200"
                  {...form.register("targetBudgetRm")}
                />
              </Field>

              <Field
                error={form.formState.errors.statedNeedText?.message}
                htmlFor="pool-need"
                label="Pool need"
                required
              >
                <Textarea
                  aria-invalid={Boolean(form.formState.errors.statedNeedText)}
                  id="pool-need"
                  placeholder="e.g. This pool will buy a village sewing machine so two families can start taking school-uniform orders."
                  {...form.register("statedNeedText")}
                />
              </Field>

              <Button className="mt-2 w-full" size="lg" type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create pool"}
                <ArrowRight aria-hidden="true" size={18} />
              </Button>
            </form>

            <div className="relative grid gap-4">
              <div
                className="relative overflow-hidden p-5 text-[var(--dl-zine-paper)]"
                style={{
                  background: "var(--dl-zine-teal)",
                  boxShadow: "5px 5px 0 var(--dl-zine-teal-deep)",
                }}
              >
                <span className="zine-display inline-block border border-[var(--dl-zine-paper)] px-2 py-0.5 text-xs uppercase tracking-[0.18em]">
                  {currentUser.kampung.name}
                </span>
                <div className="mt-4 grid gap-3">
                  <BrushHeadline color="cream" size="md" rotate={-2} as="h3">
                    First pool creator.
                  </BrushHeadline>
                  <p className="text-sm text-[var(--dl-zine-paper)] opacity-90 sm:text-base">
                    When you submit, you automatically become the first member with an allowance of{" "}
                    <strong className="zine-display text-lg text-[var(--dl-zine-paper)]">
                      RM {(currentUser.individualPayLaterAllowanceCents / 100).toFixed(0)}
                    </strong>
                    .
                  </p>
                </div>
              </div>

              <div className="zine-card grid gap-3 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--dl-badge-forest-bg)] text-[var(--dl-zine-forest)]">
                    <UsersRound aria-hidden="true" size={20} />
                  </div>
                  <div>
                    <strong className="zine-display block text-base tracking-wide">
                      2 to 8 members
                    </strong>
                    <p className="text-sm text-[var(--dl-slate)]">
                      Invite 1 to 7 other members before locking the pool.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--dl-badge-maroon-bg)] text-[var(--dl-zine-brick)]">
                    <ScrollText aria-hidden="true" size={20} />
                  </div>
                  <div>
                    <strong className="zine-display block text-base tracking-wide">
                      Need text matters
                    </strong>
                    <p className="text-sm text-[var(--dl-slate)]">
                      This copy is passed straight to the Advisor when the pool is locked and item suggestions are requested.
                    </p>
                  </div>
                </div>

                <p className="border border-dashed border-[var(--dl-zine-brick)] bg-[var(--dl-zine-paper)] p-4 text-sm text-[var(--dl-slate)]">
                  This frontend-only demo stores pool data in the current browser. For the most stable join and live updates, open the invite link in the same browser.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
