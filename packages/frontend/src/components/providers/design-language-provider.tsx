"use client";

import { useAtom } from "jotai";
import { useEffect, type ReactNode } from "react";
import { designLanguageAtom } from "@/store/ui";
import type { DesignLanguage } from "@/lib/design-language/config";

export function DesignLanguageProvider({ children }: { children: ReactNode }) {
  const [designLanguage] = useAtom(designLanguageAtom);

  // Mirror the active design language onto <html data-design-language>.
  // useEffect is the right tool here — this is a true DOM-mutation side
  // effect that has no event-handler equivalent and must run after paint.
  useEffect(() => {
    document.documentElement.dataset.designLanguage = designLanguage;
  }, [designLanguage]);

  return <>{children}</>;
}

export function useDesignLanguage(): {
  designLanguage: DesignLanguage;
  setDesignLanguage: (value: DesignLanguage) => void;
} {
  const [designLanguage, setDesignLanguage] = useAtom(designLanguageAtom);
  return { designLanguage, setDesignLanguage };
}
