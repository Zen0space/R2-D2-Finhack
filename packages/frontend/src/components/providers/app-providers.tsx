"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import type { ReactNode } from "react";
import { useState } from "react";
import { Toaster } from "sonner";
import { DesignLanguageProvider } from "@/components/providers/design-language-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <DesignLanguageProvider>
          {children}
          <Toaster richColors position="top-center" />
        </DesignLanguageProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
}
