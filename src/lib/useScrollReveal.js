import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion.js";

/**
 * useScrollReveal — adds a class to elements matching `selector` when they
 * enter the viewport. CSS handles the actual animation (fade + translate).
 *
 * Usage:
 *   useScrollReveal(".reveal", { rootMargin: "-15% 0px" });
 *   <div className="reveal">Content</div>
 */
export function useScrollReveal(selector = ".reveal", options = {}) {
  const reduced = useReducedMotion();
  const observerRef = useRef(null);

  useEffect(() => {
    if (reduced) {
      document.querySelectorAll(selector).forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "-10% 0px -10% 0px", ...options }
    );

    observerRef.current = io;

    const scan = () => {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.classList.contains("is-revealed")) io.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [selector, reduced]);
}
