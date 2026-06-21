"use client";

import { useQuery } from "@tanstack/react-query";

interface TokenUsage {
  remaining: number;
  used: number;
  total: number;
}

async function fetchTokens(): Promise<TokenUsage> {
  const res = await fetch("/api/dashboard/tokens");
  if (!res.ok) {
    if (res.status === 401) {
      return { remaining: 0, used: 0, total: 10 };
    }
    throw new Error("Failed to fetch token usage");
  }
  return res.json();
}

export function useTokens() {
  return useQuery({
    queryKey: ["tokens"],
    queryFn: fetchTokens,
    staleTime: 10_000,
    retry: 1,
  });
}
