"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  defaultDesignLanguage,
  designLanguageStorageKey,
  isDesignLanguage,
  type DesignLanguage,
} from "@/lib/design-language/config";

type DesignLanguageContextValue = {
  designLanguage: DesignLanguage;
  setDesignLanguage: (value: DesignLanguage) => void;
};

const DesignLanguageContext = createContext<DesignLanguageContextValue | null>(null);

export function DesignLanguageProvider({ children }: { children: ReactNode }) {
  const [designLanguage, setDesignLanguage] = useState<DesignLanguage>(defaultDesignLanguage);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(designLanguageStorageKey);

    if (isDesignLanguage(storedValue)) {
      setDesignLanguage(storedValue);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.designLanguage = designLanguage;
    window.localStorage.setItem(designLanguageStorageKey, designLanguage);
  }, [designLanguage]);

  return (
    <DesignLanguageContext.Provider value={{ designLanguage, setDesignLanguage }}>
      {children}
    </DesignLanguageContext.Provider>
  );
}

export function useDesignLanguage() {
  const context = useContext(DesignLanguageContext);

  if (!context) {
    throw new Error("useDesignLanguage must be used within DesignLanguageProvider.");
  }

  return context;
}
