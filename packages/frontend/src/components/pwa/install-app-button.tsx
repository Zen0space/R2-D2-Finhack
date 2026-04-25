"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { Download, Smartphone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useAppInstallPrompt } from "@/hooks/use-app-install-prompt";
import {
  canInstallAppAtom,
  clearInstallPromptAtom,
  installPromptAtom,
  isAppInstalledAtom,
  setAppInstalledAtom,
} from "@/store/ui";
import { cn } from "@/lib/utils";

export function InstallAppButton() {
  useAppInstallPrompt();

  const installPrompt = useAtomValue(installPromptAtom);
  const canInstallApp = useAtomValue(canInstallAppAtom);
  const isAppInstalled = useAtomValue(isAppInstalledAtom);
  const clearInstallPrompt = useSetAtom(clearInstallPromptAtom);
  const setAppInstalled = useSetAtom(setAppInstalledAtom);

  const install = async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();

    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setAppInstalled(true);
      return;
    }

    clearInstallPrompt();
  };

  if (isAppInstalled) {
    return (
      <span
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold",
          "border-[color:rgba(47,106,63,0.18)] bg-[color:rgba(47,106,63,0.08)] text-[color:var(--dl-forest)]",
        )}
      >
        <Smartphone aria-hidden="true" size={16} />
        Installed
      </span>
    );
  }

  if (!canInstallApp || !installPrompt) {
    return null;
  }

  return (
    <button
      className={cn(buttonVariants({ variant: "secondary" }), "h-10 rounded-full px-4")}
      type="button"
      onClick={() => void install()}
    >
      <Download aria-hidden="true" size={16} />
      Install app
    </button>
  );
}
