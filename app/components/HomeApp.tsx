"use client";
// Naudokis marketing homepage — client root (scroll-reveal, nav scroll state).
import {
  Nav, Hero, Categories, Offers, Features, Testimonials, CtaBanner, Faq, HomeSeo, Footer,
} from "./sections";
import { Chrome } from "./Chrome";
import { useScrollReveal } from "@/app/lib/use-scroll-reveal";

export function HomeApp() {
  // scroll-reveal (nav scroll-condense now lives inside <Nav>)
  useScrollReveal();

  return (
    <Chrome>
      <div className="nk-page">
        <Nav onSearch={() => document.getElementById("kategorijos")?.scrollIntoView({ behavior: "smooth" })} />
        <Hero />
        <Categories />
        <Offers />
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
