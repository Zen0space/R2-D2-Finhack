"use client";

import { useQuery } from "@tanstack/react-query";
import { nadiClient } from "@/lib/nadi/client";

export function useSelangorNadiCentresQuery() {
  return useQuery({
    queryKey: ["nadi", "centres", "selangor"],
    queryFn: () => nadiClient.listCentres({ state: "Selangor", limit: 200 }),
    staleTime: 5 * 60_000,
    retry: false,
  });
}
