"use client";
// TanStack Query provider. Mounted per page (not in the root layout) so routes
// that never query — the home page above all — ship none of the query runtime.
// Shares its config with the server-side prefetch client (app/lib/query.ts) so
// hydration matches.
//
// getQueryClient() — not makeQueryClient() — is what makes the per-page mounting
// safe: it hands every provider instance the same browser-wide cache, so a
// navigation that unmounts one provider and mounts another keeps its data.
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./lib/query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(getQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
