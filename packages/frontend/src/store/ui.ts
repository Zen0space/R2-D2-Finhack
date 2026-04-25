import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
  defaultDesignLanguage,
  designLanguageStorageKey,
  isDesignLanguage,
  type DesignLanguage,
} from "@/lib/design-language/config";
import type { BeforeInstallPromptEvent } from "@/types/pwa";

// Persisted across reloads. SSR-safe: getOnInit=false so the server uses the
// default and the client hydrates from localStorage on first paint.
export const designLanguageAtom = atomWithStorage<DesignLanguage>(
  designLanguageStorageKey,
  defaultDesignLanguage,
  {
    getItem: (key, initial) => {
      if (typeof window === "undefined") return initial;
      const stored = window.localStorage.getItem(key);
      return isDesignLanguage(stored) ? stored : initial;
    },
    setItem: (key, value) => {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(key, value);
    },
    removeItem: (key) => {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(key);
    },
  },
);

export const installPromptAtom = atom<BeforeInstallPromptEvent | null>(null);

export const isAppInstalledAtom = atom(false);

export const canInstallAppAtom = atom(
  (get) => !get(isAppInstalledAtom) && get(installPromptAtom) !== null,
);

export const setInstallPromptAtom = atom(
  null,
  (_get, set, installPrompt: BeforeInstallPromptEvent | null) => {
    set(installPromptAtom, installPrompt);
  },
);

export const clearInstallPromptAtom = atom(null, (_get, set) => {
  set(installPromptAtom, null);
});

export const setAppInstalledAtom = atom(null, (_get, set, isAppInstalled: boolean) => {
  set(isAppInstalledAtom, isAppInstalled);

  if (isAppInstalled) {
    set(installPromptAtom, null);
  }
});
