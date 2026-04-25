"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { setAppInstalledAtom, setInstallPromptAtom } from "@/store/ui";
import type { BeforeInstallPromptEvent, NavigatorWithStandalone } from "@/types/pwa";

function isBeforeInstallPromptEvent(event: Event): event is BeforeInstallPromptEvent {
  return "prompt" in event && typeof (event as BeforeInstallPromptEvent).prompt === "function";
}

function isInstalledDisplayMode() {
  const navigatorWithStandalone = navigator as NavigatorWithStandalone;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function useAppInstallPrompt() {
  const setInstallPrompt = useSetAtom(setInstallPromptAtom);
  const setAppInstalled = useSetAtom(setAppInstalledAtom);

  useEffect(() => {
    // PWA install availability only surfaces through browser-level events.
    setAppInstalled(isInstalledDisplayMode());

    const onBeforeInstallPrompt = (event: Event) => {
      if (!isBeforeInstallPromptEvent(event)) {
        return;
      }

      event.preventDefault();
      setInstallPrompt(event);
    };

    const onInstalled = () => {
      setAppInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [setAppInstalled, setInstallPrompt]);
}
