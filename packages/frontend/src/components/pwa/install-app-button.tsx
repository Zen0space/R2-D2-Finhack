"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { Download, Smartphone } from "lucide-react";
import { useAppInstallPrompt } from "@/hooks/use-app-install-prompt";
import {
  canInstallAppAtom,
  clearInstallPromptAtom,
  installPromptAtom,
  isAppInstalledAtom,
  setAppInstalledAtom,
} from "@/store/ui";

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
      <span className="install-status">
        <Smartphone aria-hidden="true" size={16} />
        Installed
      </span>
    );
  }

  if (!canInstallApp || !installPrompt) {
    return null;
  }

  return (
    <button className="install-button" type="button" onClick={() => void install()}>
      <Download aria-hidden="true" size={16} />
      Install app
    </button>
  );
}
