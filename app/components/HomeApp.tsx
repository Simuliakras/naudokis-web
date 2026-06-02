"use client";
// Naudokis marketing homepage — client root (state, scroll-reveal, nav scroll state).
import { useCallback, useEffect, useState } from "react";
import {
  Nav, Hero, Categories, Offers, Features, Testimonials, CtaBanner, Faq, Footer, Listing,
} from "./sections";
import { ListingSheet } from "./ListingSheet";

export function HomeApp() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Listing | null>(null);
  const closeSheet = useCallback(() => setActive(null), []);
  const resetQuery = useCallback(() => setQuery(""), []);

  useEffect(() => {
    // scroll-reveal
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("nk-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".nk-reveal").forEach((el) => io.observe(el));
    // nav scroll state
    const nav = document.querySelector(".nk-nav-bar");
    const onScroll = () => { if (nav) nav.classList.toggle("nk-scrolled", window.scrollY > 20); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <div className="nk-page">
      <Nav onSearch={() => document.getElementById("kategorijos")?.scrollIntoView({ behavior: "smooth" })} />
      <Hero query={query} setQuery={setQuery} />
      <Categories query={query} onOpen={setActive} onReset={resetQuery} />
      <Offers query={query} onOpen={setActive} onReset={resetQuery} />
      <Features />
      <Testimonials />
      <CtaBanner />
      <Faq />
      <Footer />
      <ListingSheet item={active} onClose={closeSheet} />
    </div>
  );
}
