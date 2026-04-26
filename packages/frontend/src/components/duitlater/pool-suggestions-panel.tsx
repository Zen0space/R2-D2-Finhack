"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Boxes,
  Home,
  Package,
  ShoppingBasket,
  Sparkles,
  Sprout,
  Waves,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import type { PoolRecord, PoolSuggestionFilter, PoolSuggestionRecord } from "@/types/pool";
import { poolNeedCategories } from "@/types/pool";

type PoolSuggestionsPanelProps = {
  activeFilter: PoolSuggestionFilter;
  catalogueMatchCount: number;
  choosePendingSuggestionId: string | null;
  isChoosePending: boolean;
  isSuggestPending: boolean;
  onChoose: (suggestionId: string) => void;
  onSuggest: (filter: PoolSuggestionFilter) => void;
  pool: PoolRecord;
  selectedSuggestion: PoolSuggestionRecord | null;
};

const categoryIconMap: Record<PoolSuggestionFilter, LucideIcon> = {
  semua: Boxes,
  makanan: ShoppingBasket,
  "alat-sekolah": BookOpen,
  peralatan: Package,
  elektrik: Zap,
  pertanian: Sprout,
  air: Waves,
  rumah: Home,
  "lain-lain": Boxes,
};

const categoryLabelMap: Record<PoolSuggestionFilter, string> = {
  semua: "All",
  makanan: "Food",
  "alat-sekolah": "School supplies",
  peralatan: "Equipment",
  elektrik: "Electrical",
  pertanian: "Farming",
  air: "Water",
  rumah: "Home",
  "lain-lain": "Other",
};

const phaseThreeFilters: PoolSuggestionFilter[] = [
  "semua",
  "makanan",
  "alat-sekolah",
  "peralatan",
  "elektrik",
  "pertanian",
  "air",
  "rumah",
];

export function PoolSuggestionsPanel({
  activeFilter,
  catalogueMatchCount,
  choosePendingSuggestionId,
  isChoosePending,
  isSuggestPending,
  onChoose,
  onSuggest,
  pool,
  selectedSuggestion,
}: PoolSuggestionsPanelProps) {
  const hasSuggestions = pool.suggestions.length > 0;

  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-3">
                <Badge tone="gold">AI Advisor</Badge>
                <Badge
                  tone={
                    pool.state === "voting" || pool.state === "approved" || pool.state === "active"
                      ? "forest"
                      : "maroon"
                  }
                >
                  {pool.state === "voting"
                    ? "Voting open"
                    : pool.state === "approved"
                      ? "Awaiting NADI"
                      : pool.state === "active"
                        ? "Active"
                        : "Item shortlist"}
                </Badge>
              </div>
              <div className="grid gap-2">
                <CardTitle className="text-4xl">Item suggestions for this pool</CardTitle>
                <CardDescription className="max-w-3xl text-base">
                  The Advisor scores the MyKasih catalogue based on the combined cap, the need category, and the need text you locked in Phase 2.
                </CardDescription>
              </div>
            </div>

            <div className="grid gap-3 rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)] p-4 lg:min-w-[16rem]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                Catalogue scored
              </p>
              <p className="text-3xl font-semibold text-[color:var(--dl-ink)]">{catalogueMatchCount}</p>
              <p className="text-sm text-[color:var(--dl-slate)]">
                items fit the {formatCurrency(pool.combinedCapCents ?? 0)} cap
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-5">
          <div className="flex flex-wrap gap-2">
            {phaseThreeFilters.map((filter) => {
              const Icon = categoryIconMap[filter];
              const isActive = activeFilter === filter;

              return (
                <Button
                  className="h-10"
                  disabled={isSuggestPending}
                  key={filter}
                  size="sm"
                  variant={isActive ? "secondary" : "outline"}
                  onClick={() => onSuggest(filter)}
                >
                  <Icon aria-hidden="true" size={15} />
                  {categoryLabelMap[filter]}
                </Button>
              );
            })}
          </div>

          {selectedSuggestion ? (
            <div className="grid gap-4 rounded-[1.75rem] border border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="grid gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-forest)]">
                    Selected item
                  </p>
                  <h3 className="text-3xl">{selectedSuggestion.nameBm}</h3>
                </div>
                <Badge tone="forest">
                  {pool.state === "approved"
                    ? "Vote passed"
                    : pool.state === "active"
                      ? "Delivery confirmed"
                      : "Ready for voting"}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.25rem] bg-white/82 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                    Price
                  </p>
                  <p className="mt-2 text-lg font-semibold">{formatCurrency(selectedSuggestion.priceCents)}</p>
                </div>
                <div className="rounded-[1.25rem] bg-white/82 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                    Allocation
                  </p>
                  <p className="mt-2 text-lg font-semibold">{selectedSuggestion.allocationPct}% of pool cap</p>
                </div>
                <div className="rounded-[1.25rem] bg-white/82 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                    Category
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {poolNeedCategories.find((item) => item.value === selectedSuggestion.category)?.label ?? "Other"}
                  </p>
                </div>
              </div>

              <p className="text-sm text-[color:var(--dl-forest)] sm:text-base">{selectedSuggestion.reasoningBm}</p>
            </div>
          ) : null}

          {!hasSuggestions && !isSuggestPending ? (
            <div className="grid gap-4 rounded-[1.75rem] border border-dashed border-[color:rgba(122,46,46,0.18)] bg-[color:rgba(122,46,46,0.04)] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.25rem] bg-[color:rgba(200,148,31,0.14)] text-[color:var(--dl-gold-dark)]">
                  <Sparkles aria-hidden="true" size={18} />
                </div>
                <div className="grid gap-2">
                  <h3 className="text-3xl">No suggestions yet.</h3>
                  <p className="max-w-2xl text-sm text-[color:var(--dl-slate)] sm:text-base">
                    Click the button below to generate the first 5 suggestions. Each card shows the item name, price, cap allocation, category, and the reason it ranked.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => onSuggest(activeFilter)}>
                  <Sparkles aria-hidden="true" size={18} />
                  Suggest items
                </Button>
                <span className="inline-flex items-center rounded-full border border-[color:var(--dl-sand)] bg-white/78 px-4 py-2 text-sm text-[color:var(--dl-slate)]">
                  Active filter: {categoryLabelMap[activeFilter]}
                </span>
              </div>
            </div>
          ) : null}

          {isSuggestPending ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  className="h-72 animate-pulse rounded-[1.75rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.72)]"
                  key={`suggestion-skeleton-${index}`}
                />
              ))}
            </div>
          ) : null}

          {hasSuggestions ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {pool.suggestions.map((suggestion) => {
                const Icon = categoryIconMap[suggestion.category];
                const isSelected = pool.selectedSuggestionId === suggestion.id;
                const categoryLabel =
                  poolNeedCategories.find((item) => item.value === suggestion.category)?.label ?? "Other";

                return (
                  <article
                    className={cn(
                      "grid gap-4 rounded-[1.75rem] border p-5 shadow-[0_10px_24px_rgba(73,53,19,0.06)]",
                      isSelected
                        ? "border-[color:rgba(47,106,63,0.24)] bg-[color:rgba(47,106,63,0.06)]"
                        : "border-[color:var(--dl-sand)] bg-white/84",
                    )}
                    key={suggestion.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-[color:rgba(122,46,46,0.12)] bg-[color:rgba(248,244,236,0.92)] text-[color:var(--dl-maroon)]">
                        <Icon aria-hidden="true" size={24} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="neutral">#{suggestion.rank}</Badge>
                        <Badge tone="gold">{categoryLabel}</Badge>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <h3 className="text-3xl">{suggestion.nameBm}</h3>
                      <p className="text-sm text-[color:var(--dl-slate)]">
                        A placeholder visual is shown for now; once the backend wires `imageUrl`, the real catalogue image will appear here.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.68)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                          Price
                        </p>
                        <p className="mt-2 text-lg font-semibold">{formatCurrency(suggestion.priceCents)}</p>
                      </div>
                      <div className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-white/78 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                          Allocation
                        </p>
                        <p className="mt-2 text-lg font-semibold">{suggestion.allocationPct}% of pool cap</p>
                      </div>
                    </div>

                    <p className="text-sm text-[color:var(--dl-ink)] sm:text-base">{suggestion.reasoningBm}</p>

                    <Button
                      className="w-full"
                      disabled={!["locked", "suggesting"].includes(pool.state) || isChoosePending}
                      size="lg"
                      variant={isSelected ? "secondary" : "primary"}
                      onClick={() => onChoose(suggestion.id)}
                    >
                      {isSelected
                        ? "Already selected"
                        : choosePendingSuggestionId === suggestion.id
                          ? "Selecting..."
                          : "Choose this item"}
                    </Button>
                  </article>
                );
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
