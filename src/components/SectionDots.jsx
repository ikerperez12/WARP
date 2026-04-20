import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import "./SectionDots.css";

const SECTIONS = [
  { id: "hero", selector: "#hero" },
  { id: "creative", selector: "#vt-creative" },
  { id: "about", selector: "#about" },
  { id: "services", selector: "#services" },
  { id: "stack", selector: "#stack" },
  { id: "blueprint", selector: ".blueprint-stage" },
  { id: "alloy", selector: ".liquid-metal-transition" },
  { id: "projects", selector: "#projects" },
  { id: "mastery", selector: "#vt-mastery" },
  { id: "experience", selector: "#experience" },
  { id: "galaxy", selector: ".galaxy-stage" },
  { id: "morph", selector: "#morph" },
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
