"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/client";

export function useSessionQuery() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => authClient.getSession(),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}
