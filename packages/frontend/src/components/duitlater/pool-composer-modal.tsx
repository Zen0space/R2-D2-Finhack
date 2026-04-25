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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      toast.error(formatErrorMessage(error, "Tak dapat cipta pool sekarang."));
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
        <Card className="w-full max-w-3xl overflow-hidden">
          <CardHeader className="gap-4 border-b border-[color:rgba(224,216,200,0.72)]">
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-3">
                <Badge tone="gold">Phase 2 frontend</Badge>
                <div className="grid gap-2">
                  <CardTitle className="text-5xl">Cipta pool baharu</CardTitle>
                  <CardDescription className="max-w-2xl text-base">
                    Isi nama, keperluan, kategori, dan target budget. Lepas ini anda akan terus
                    masuk ke halaman detail pool untuk jemput ahli dan lock combined cap.
                  </CardDescription>
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

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-[color:rgba(122,46,46,0.12)] bg-[linear-gradient(160deg,rgba(122,46,46,0.94),rgba(200,148,31,0.92))] p-5 text-white">
                <Badge className="border-white/16 bg-white/10 text-white" tone="neutral">
                  {currentUser.kampung.name}
                </Badge>
                <div className="mt-4 grid gap-3">
                  <h3 className="text-4xl">Pencipta pool pertama.</h3>
                  <p className="text-sm text-white/78 sm:text-base">
                    Bila anda submit, anda automatik jadi ahli pertama dengan allowance
                    {` `}
                    <strong className="text-white">RM {(currentUser.individualPayLaterAllowanceCents / 100).toFixed(0)}</strong>.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 rounded-[1.75rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:rgba(200,148,31,0.14)] text-[color:var(--dl-gold-dark)]">
                    <UsersRound aria-hidden="true" size={20} />
                  </div>
                  <div>
                    <strong className="block text-base">2 hingga 8 ahli</strong>
                    <p className="text-sm text-[color:var(--dl-slate)]">
                      Jemput 1 hingga 7 ahli lain sebelum lock pool.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:rgba(122,46,46,0.08)] text-[color:var(--dl-maroon)]">
                    <ScrollText aria-hidden="true" size={20} />
                  </div>
                  <div>
                    <strong className="block text-base">Need text penting</strong>
                    <p className="text-sm text-[color:var(--dl-slate)]">
                      Copy ini akan dibawa terus ke Phase 3 bila pool dah locked dan minta cadangan barang.
                    </p>
                  </div>
                </div>

                <p className="rounded-[1.25rem] border border-dashed border-[color:rgba(122,46,46,0.16)] bg-white/80 p-4 text-sm text-[color:var(--dl-slate)]">
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
