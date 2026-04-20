import { useEffect, useState } from "react";
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
  { id: "cv", selector: ".blueprint-stage" },
  { id: "code", selector: "#code" },
  { id: "alloy", selector: ".liquid-metal-transition" },
  { id: "projects", selector: "#projects" },
  { id: "more", selector: "#vt-mastery" },
  { id: "path", selector: "#experience" },
  { id: "faq", selector: "#faq" },
  { id: "hire", selector: "#resume-cta" },
  { id: "contact", selector: "#contact" },
];

export default function SectionDots() {
  const [active, setActive] = useState(0);
  const { lang } = useI18n();

  useEffect(() => {
    const observers = SECTIONS.map((section, i) => {
      const el = document.querySelector(section.selector);
      if (!el) return null;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(i);
        },
        { threshold: 0.3, rootMargin: "-30% 0px -30% 0px" }
      );
      io.observe(el);
      return io;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  const jumpTo = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="section-dots" aria-label={lang === "en" ? "Section navigation" : "Navegacion por seccion"}>
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
