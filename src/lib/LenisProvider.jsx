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
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
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
