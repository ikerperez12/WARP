import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import "./SectionDots.css";

const SECTIONS = [
  { id: "hero", selector: "#hero" },
  { id: "intro", selector: "#vt-creative" },
  { id: "about", selector: "#about" },
  { id: "metrics", selector: "#metrics" },
  { id: "services", selector: "#services" },
  { id: "stack", selector: "#stack" },
  { id: "radar", selector: "#tech-radar" },
  { id: "process", selector: "#process" },
  { id: "principles", selector: "#principles" },
  { id: "now", selector: "#now" },
  { id: "cv", selector: ".blueprint-stage" },
  { id: "code", selector: "#code" },
  { id: "visuals", selector: "#visuals-bridge" },
  { id: "projects", selector: "#projects" },
  { id: "case", selector: "#case-study" },
  { id: "more", selector: "#vt-mastery" },
  { id: "path", selector: "#experience" },
  { id: "awards", selector: "#achievements" },
  { id: "faq", selector: "#faq" },
  { id: "hire", selector: "#resume-cta" },
  { id: "contact", selector: "#contact" },
];

/**
 * Section tracking via scroll position. Pick the section whose top edge is
 * closest to (but not below) the viewport's upper third. Updated on every
 * scroll tick using requestAnimationFrame throttle so the highlight never
 * lags behind the actual scroll.
 */
export default function SectionDots() {
  const [active, setActive] = useState(0);
  const { lang } = useI18n();
  const rafRef = useRef(0);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.querySelector(s.selector));

    const update = () => {
      const target = window.innerHeight * 0.35;
      let best = 0;
      let bestDelta = Infinity;
      elements.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Pick the section whose top is closest to target line, preferring
        // sections whose top is at or above the target (already in view).
        const delta = rect.top - target;
        const absPenalty = delta > 0 ? delta * 1.2 : -delta;
        if (absPenalty < bestDelta) {
          bestDelta = absPenalty;
          best = i;
        }
      });
      setActive(best);
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        update();
        rafRef.current = 0;
      });
    };

    // Re-query in case lazy sections mount after initial paint
    const rescan = () => {
      SECTIONS.forEach((s, i) => {
        if (!elements[i]) elements[i] = document.querySelector(s.selector);
      });
      update();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const rescanInterval = setInterval(rescan, 1500);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearInterval(rescanInterval);
    };
  }, []);

  const jumpTo = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="section-dots"
      aria-label={lang === "en" ? "Section navigation" : "Navegacion por seccion"}
    >
      <span className="section-dots-rail" aria-hidden="true" />
      {SECTIONS.map((section, i) => (
        <button
          key={section.id}
          type="button"
          className={`section-dot ${active === i ? "is-active" : ""}`}
          onClick={() => jumpTo(section.selector)}
          aria-label={`Jump to ${section.id}`}
        >
          <span className="section-dot-label">{section.id}</span>
          <span className="section-dot-mark" aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}
