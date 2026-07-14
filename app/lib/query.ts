// Shared TanStack Query config + a server-side client factory.
// The same defaults back the client provider (app/providers.tsx) and the
// per-request server client used to prefetch data into the initial HTML, so a
// server-prefetched query hydrates on the client without an immediate refetch
// (staleTime keeps it fresh). No server-only imports here, so this module is
// safe to pull into the client provider too.
import { QueryClient, QueryCache, type QueryClientConfig } from "@tanstack/react-query";
import { captureException } from "./report-error";

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
      captureException(error, { queryKey: query.queryKey });
    },
  });
}

// A fresh client per server render — prefetch into it, then dehydrate. Never call
// this on the client: see getQueryClient().
export function makeQueryClient() {
  return new QueryClient({ ...queryClientConfig, queryCache: makeQueryCache() });
}

// In the browser the client must be a module singleton, NOT per-provider state.
// <QueryProvider> is mounted per page rather than in the root layout (so the home
// page ships no query runtime at all), and a page subtree unmounts on every
// navigation — a per-provider client would therefore throw the whole cache away
// each time, refetching categories on every route change and dropping the feed's
// accumulated infinite-scroll pages on Back.
//
// On the server there is no singleton: each request must dehydrate its own cache,
// or one visitor's data would leak into another's HTML.
let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
