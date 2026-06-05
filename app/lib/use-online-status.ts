// Tracks the browser's online/offline status. SSR-safe (assumes online until
// the client mounts), so the offline empty state (L6) only ever shows after
// hydration — never during server render.
import { useEffect, useRef, useState } from "react";

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

// Auto-reload after an offline failure (L6/C-offline): refetch only on the
// offline→online edge while the last load errored — not on every error toggle,
// so it never loops while genuinely offline or on a fresh online error.
export function useReloadOnReconnect({ online, isError, refetch }: {
  online: boolean;
  isError: boolean;
  refetch: () => void;
}) {
  const wasOnline = useRef(online);
  useEffect(() => {
    if (online && !wasOnline.current && isError) {
      refetch();
    }
    wasOnline.current = online;
  }, [online, isError, refetch]);
}
