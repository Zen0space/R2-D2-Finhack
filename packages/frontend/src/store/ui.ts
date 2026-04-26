import { atom } from "jotai";
import type { BeforeInstallPromptEvent } from "@/types/pwa";

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
