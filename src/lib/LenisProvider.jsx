import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./useReducedMotion.js";

gsap.registerPlugin(ScrollTrigger);

export function LenisProvider({ children }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      // More responsive: lower duration + higher wheelMultiplier = fluid, fast, doesn't hold back
      duration: 0.7,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1.4,
      touchMultiplier: 1.2,
      lerp: 0.14,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const rafUpdate = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(rafUpdate);
    gsap.ticker.lagSmoothing(0);

    window.__lenis = lenis;

    return () => {
      gsap.ticker.remove(rafUpdate);
      lenis.destroy();
      delete window.__lenis;
    };
  }, [reduced]);

  return children;
}
