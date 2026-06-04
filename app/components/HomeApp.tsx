"use client";
// Naudokis marketing homepage — client root (scroll-reveal, nav scroll state).
import { useEffect } from "react";
import {
  Nav, Hero, Categories, Offers, HowItWorks, Features, Testimonials, CtaBanner, Faq, HomeSeo, Footer,
} from "./sections";
import { Chrome } from "./Chrome";

export function HomeApp() {
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
    <Chrome>
      <div className="nk-page">
        <Nav onSearch={() => document.getElementById("kategorijos")?.scrollIntoView({ behavior: "smooth" })} />
        <Hero />
        <Categories />
        <Offers />
        <HowItWorks />
        <Features />
        <Testimonials />
        <CtaBanner />
        <Faq />
        <HomeSeo />
        <Footer />
      </div>
    </Chrome>
  );
}
