"use client";
// Naudokis marketing homepage — client root (scroll-reveal, nav scroll state).
import { useEffect } from "react";
import {
  Nav, Hero, Categories, Offers, HowItWorks, Features, Testimonials, CtaBanner, Faq, HomeSeo, Footer,
} from "./sections";
import { Chrome } from "./Chrome";

export function HomeApp() {
  useEffect(() => {
    // scroll-reveal (nav scroll-condense now lives inside <Nav>)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("nk-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".nk-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
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
