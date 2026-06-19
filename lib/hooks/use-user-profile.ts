"use client";

import { useQuery } from "@tanstack/react-query";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  accountName: string | null;
  industry: string | null;
  accountType: "BRAND" | "INFLUENCER" | null;
  description: string | null;
  avatarUrl: string | null;
  avatarFileKey: string | null;
  provider: "CREDENTIALS" | "GOOGLE";
}

async function fetchUserProfile(): Promise<UserProfile> {
  const res = await fetch("/api/dashboard/user");
  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }
  return res.json();
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchUserProfile,
    staleTime: 30_000,
  });
}
