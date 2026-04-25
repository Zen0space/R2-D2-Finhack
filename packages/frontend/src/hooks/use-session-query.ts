"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient, API_BASE } from "@/lib/auth/client";
import type { MemberProfile, Session } from "@/types/auth";

type UserApiData = {
  id: string;
  email: string;
  name: string;
  role: string;
  individualPaylaterCents: number;
  kampung: {
    id: string;
    name: string;
    state: string;
    districtHint: string;
  } | null;
};

function mapToMemberProfile(data: UserApiData): MemberProfile {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: (data.role?.toLowerCase() ?? "member") as MemberProfile["role"],
    individualPayLaterAllowanceCents: data.individualPaylaterCents,
    kampung: data.kampung
      ? {
          id: data.kampung.id,
          name: data.kampung.name,
          district: data.kampung.districtHint ?? "",
          state: data.kampung.state,
        }
      : {
          id: "unknown",
          name: "Felda Gedangsa",
          district: "Hulu Selangor",
          state: "Selangor",
        },
  };
}

export function useSessionQuery() {
  return useQuery<Session | null>({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const { data: sessionData } = await authClient.getSession();
      if (!sessionData?.user) return null;

      const res = await fetch(`${API_BASE}/api/v1/user`, {
        credentials: "include",
      });
      if (!res.ok) return null;

      const body = (await res.json()) as { success: boolean; data: UserApiData };
      if (!body.success) return null;

      return { user: mapToMemberProfile(body.data) };
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
}
