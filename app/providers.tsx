"use client";
// App-wide client providers (TanStack Query). Shares its config with the
// server-side prefetch client (app/lib/query.ts) so hydration matches.
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "./lib/query";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
