"use client";
// Renders nothing — mounts the .nk-reveal IntersectionObserver from a server
// page (the hook needs a client component; effects run after hydration, when
// every server-rendered .nk-reveal node is already in the DOM).
import { useScrollReveal } from "@/app/lib/use-scroll-reveal";

export function ScrollReveal() {
  useScrollReveal();
  return null;
}
