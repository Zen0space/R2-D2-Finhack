"use client";

import { useQuery } from "@tanstack/react-query";
import type { MemberProfile } from "@/types/auth";
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

export function useNadiPoolsQuery(user: MemberProfile | null) {
  return useQuery({
    queryKey: ["pools", "nadi", user?.id],
    queryFn: () => poolsClient.listForNadi(user as MemberProfile),
    enabled: user?.role === "nadi_staff",
    refetchInterval: 2_000,
  });
}

export function useKampungTrustQuery(kampungId: string | null) {
  return useQuery({
    queryKey: ["kampung", "trust", kampungId],
    queryFn: () => poolsClient.getKampungTrust(kampungId ?? ""),
    enabled: kampungId !== null,
    refetchInterval: 5_000,
  });
}
