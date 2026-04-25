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
  name: z.string().trim().min(3, "Nama pool minimum 3 huruf."),
  statedNeedCategory: z
    .string()
    .refine((value) => poolNeedCategories.some((category) => category.value === value), "Pilih kategori."),
  statedNeedText: z.string().trim().min(12, "Terangkan keperluan pool dengan lebih jelas."),
  targetBudgetRm: z
    .string()
    .trim()
    .refine((value) => {
      const amount = Number(value);
      return Number.isFinite(amount) && amount >= 50;
    }, "Target budget minimum RM 50."),
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
      toast.success("Pool berjaya dicipta. Jemput ahli lain sekarang.");
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
                    Cipta pool baharu
                  </BrushHeadline>
                  <p className="zine-display max-w-2xl text-sm tracking-[0.06em] text-[var(--dl-zine-ink)] md:text-base">
                    Isi nama, keperluan, kategori, dan target budget. Lepas ini terus masuk halaman
                    detail pool — jemput ahli, lock combined cap, lepas tu Penasihat suggest barang.
                  </p>
                </div>
              </div>

              <Button aria-label="Tutup modal" variant="ghost" size="sm" onClick={onClose}>
                <X aria-hidden="true" size={18} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid gap-6 py-6 lg:grid-cols-[1.05fr_0.95fr]">
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
            >
              <Field error={form.formState.errors.name?.message} htmlFor="pool-name" label="Nama pool" required>
                <Input
                  aria-invalid={Boolean(form.formState.errors.name)}
                  id="pool-name"
                  placeholder="Contoh: Jahit Rezeki Gedangsa"
                  {...form.register("name")}
                />
              </Field>

              <Field
                error={form.formState.errors.statedNeedCategory?.message}
                htmlFor="pool-category"
                label="Kategori keperluan"
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
                label="Keperluan pool"
                required
              >
                <Textarea
                  aria-invalid={Boolean(form.formState.errors.statedNeedText)}
                  id="pool-need"
                  placeholder="Contoh: Pool ini untuk beli mesin jahit kampung supaya dua keluarga boleh mula ambil tempahan baju sekolah."
                  {...form.register("statedNeedText")}
                />
              </Field>

              <Button className="mt-2 w-full" size="lg" type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Sedang cipta..." : "Cipta pool"}
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
                    Pencipta pool pertama.
                  </BrushHeadline>
                  <p className="text-sm text-[var(--dl-zine-paper)] opacity-90 sm:text-base">
                    Bila kau submit, kau automatik jadi ahli pertama dengan allowance{" "}
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
                      2 hingga 8 ahli
                    </strong>
                    <p className="text-sm text-[var(--dl-slate)]">
                      Jemput 1 hingga 7 ahli lain sebelum lock pool.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--dl-badge-maroon-bg)] text-[var(--dl-zine-brick)]">
                    <ScrollText aria-hidden="true" size={20} />
                  </div>
                  <div>
                    <strong className="zine-display block text-base tracking-wide">
                      Need text penting
                    </strong>
                    <p className="text-sm text-[var(--dl-slate)]">
                      Copy ini dibawa terus ke Penasihat bila pool dah locked dan minta cadangan barang.
                    </p>
                  </div>
                </div>

                <p className="border border-dashed border-[var(--dl-zine-brick)] bg-[var(--dl-zine-paper)] p-4 text-sm text-[var(--dl-slate)]">
                  Demo frontend-only ini simpan data pool dalam browser semasa. Untuk ujian join dan
                  live update paling stabil, buka link jemputan dalam browser yang sama.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
