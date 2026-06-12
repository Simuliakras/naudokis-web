// Shared TanStack Query config + a server-side client factory.
// The same defaults back the client provider (app/providers.tsx) and the
// per-request server client used to prefetch data into the initial HTML, so a
// server-prefetched query hydrates on the client without an immediate refetch
// (staleTime keeps it fresh). No server-only imports here, so this module is
// safe to pull into the client provider too.
import { QueryClient, QueryCache, type QueryClientConfig } from "@tanstack/react-query";
import * as Sentry from "@sentry/nextjs";

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
  },
};

// Data-layer failures only surface as `isError` UI, so report them here too —
// the error boundaries never see a failed query. The cache must be built per
// client (it holds query state), so it can't live in queryClientConfig.
// Sentry is a no-op without a DSN, on the server prefetch path included.
function makeQueryCache() {
  return new QueryCache({
    onError: (error, query) => {
      Sentry.captureException(error, { extra: { queryKey: query.queryKey } });
    },
  });
}

// A fresh client per server render — prefetch into it, then dehydrate. On the
// client, app/providers.tsx keeps a single long-lived client in state instead.
export function makeQueryClient() {
  return new QueryClient({ ...queryClientConfig, queryCache: makeQueryCache() });
}
