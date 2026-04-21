import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * LenisProvider — NATIVE SCROLL MODE.
 *
 * Lenis smooth scrolling was making the wheel feel "controlled" no matter how
 * aggressive we tuned it. The user wants free, unrestrained scroll, so we drop
 * the smoothing layer entirely and let the browser handle it natively.
 *
 * We still register ScrollTrigger so GSAP scroll-driven animations keep working.
 * We just don't proxy scroll through Lenis anymore.
 */
export function LenisProvider({ children }) {
  useEffect(() => {
    let rafId = 0;

    const scheduleRefresh = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        ScrollTrigger.refresh();
      });
    };

    // ScrollTrigger uses window scroll events natively when no proxy is set.
    // Refresh both after load and whenever the document height changes because
    // cv-lazy sections expand later and can desync far-down triggers.
    const resizeObserver = new ResizeObserver(() => {
      scheduleRefresh();
    });

    window.addEventListener("load", scheduleRefresh);
    window.addEventListener("resize", scheduleRefresh);
    resizeObserver.observe(document.body);
    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener("load", scheduleRefresh);
      window.removeEventListener("resize", scheduleRefresh);
      resizeObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return children;
}
