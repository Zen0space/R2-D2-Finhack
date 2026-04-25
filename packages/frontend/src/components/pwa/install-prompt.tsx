"use client";

import { useAppInstallPrompt } from "@/hooks/use-app-install-prompt";

export function InstallPromptListener() {
  useAppInstallPrompt();

  return null;
}
