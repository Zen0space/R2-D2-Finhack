"use client";

import { useQuery } from "@tanstack/react-query";
import { poolsClient } from "@/lib/pools/client";

export function usePoolsQuery(userId: string | null) {
  return useQuery({
    queryKey: ["pools", "mine", userId],
    queryFn: () => poolsClient.listMine(userId ?? ""),
    enabled: userId !== null,
  });
}

export function usePoolDetailQuery(poolId: string | null) {
  return useQuery({
    queryKey: ["pools", "detail", poolId],
    queryFn: () => poolsClient.getById(poolId ?? ""),
    enabled: poolId !== null,
    refetchInterval: 2_000,
  });
}

export function usePoolInviteQuery(inviteCode: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["pools", "invite", inviteCode],
    queryFn: () => poolsClient.getByInviteCode(inviteCode ?? ""),
    enabled: (options?.enabled ?? true) && inviteCode !== null,
    refetchInterval: 2_000,
  });
}
