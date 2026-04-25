import { atom } from "jotai";
import type { PoolSuggestionFilter } from "@/types/pool";

export const poolComposerOpenAtom = atom(false);

export const pendingSuggestionFilterAtom = atom<PoolSuggestionFilter | null>(null);

export const pendingSuggestionIdAtom = atom<string | null>(null);
