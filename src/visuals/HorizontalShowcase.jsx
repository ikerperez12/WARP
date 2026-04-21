import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./HorizontalShowcase.css";

gsap.registerPlugin(ScrollTrigger);

const CARDS = {
  es: [
    { tag: "BACK-01", title: "Diseño de APIs REST", body: "Recursos, contratos, paginación y errores normalizados. Código que se lee bien el lunes a las 9.", chip: "Spring · FastAPI · Node" },
    { tag: "OPS-02", title: "Entornos reproducibles", body: "Imágenes Docker multi-stage, compose para dev y pipelines CI que fallan antes que producción.", chip: "Docker · GitHub Actions · CI" },
    { tag: "SEC-03", title: "Seguridad aplicada", body: "OWASP Top 10, validación de entrada, análisis de tráfico y trabajo con criptografía postcuántica.", chip: "Wireshark · PQC · TLS" },
    { tag: "DATA-04", title: "Persistencia con criterio", body: "PostgreSQL, modelado, índices y migraciones. Saber cuándo SQL y cuándo documento.", chip: "PostgreSQL · MySQL · Redis" },
    { tag: "AUTO-05", title: "Automatización real", body: "Scripts que se usan, CLIs que se quedan e integración con modelos cuando aportan control.", chip: "Python · LLM Ops · Playwright" },
    { tag: "UX-06", title: "Interfaces útiles", body: "React cuando hace falta, HTML semántico siempre y una capa visual conectada con datos.", chip: "React · TypeScript · Accesibilidad" },
  ],
  en: [
    { tag: "BACK-01", title: "REST API design", body: "Resources, contracts, pagination and normalized errors. Code that still reads well on a Monday at 9.", chip: "Spring · FastAPI · Node" },
    { tag: "OPS-02", title: "Reproducible environments", body: "Multi-stage Docker, compose for dev and CI pipelines that fail before production does.", chip: "Docker · GitHub Actions · CI" },
    { tag: "SEC-03", title: "Applied security", body: "OWASP Top 10, input validation, traffic analysis and post-quantum cryptography work.", chip: "Wireshark · PQC · TLS" },
    { tag: "DATA-04", title: "Persistence with judgement", body: "PostgreSQL, modeling, indexes and migrations. Knowing when SQL wins and when documents fit better.", chip: "PostgreSQL · MySQL · Redis" },
    { tag: "AUTO-05", title: "Real automation", body: "Scripts that get used, CLIs that stay and model integration when it improves control.", chip: "Python · LLM Ops · Playwright" },
    { tag: "UX-06", title: "Useful interfaces", body: "React when needed, semantic HTML by default and UI that stays connected to data rather than decoration.", chip: "React · TypeScript · Accessibility" },
  ],
};

/**
 * HorizontalShowcase — GSAP pin pattern, same as VideoCurtain.
 *
 * Layout: a fixed 100vh section with a flex track inside. GSAP pins the
 * section and drives a horizontal `x` translate on the track from 0 to
 * -(track.scrollWidth - viewportWidth), matching its scroll-trigger length.
 *
 * The pin + scrub combination means:
 *   - if you scroll fast, the cards fly by fast
 *   - if you scroll slow, they glide slowly
 *   - either way, you must scroll through the entire pin before Process
 *     appears — no double-appearance, no skipping, no bouncing back
 */
export default function HorizontalShowcase() {
  const { lang } = useI18n();
  const cards = useMemo(() => CARDS[lang], [lang]);
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [compact, setCompact] = useState(
    typeof window !== "undefined" && window.matchMedia("(max-width: 960px)").matches
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 960px)");
    const sync = () => setCompact(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Reduced-motion or mobile compact view: render as a vertical list,
    // skip any scroll hijacking.
    if (reduced || compact) {
      gsap.set(track, { clearProps: "x" });
      return;
    }

    const ctx = gsap.context(() => {
      // Measure total horizontal travel and pin the section for exactly that
      // many pixels of scroll. That way the relationship between scroll and
      // card travel is 1:1 — no bounce, no reappearance.
      const getTravel = () =>
        Math.max(0, track.scrollWidth - window.innerWidth);

      const tween = gsap.to(track, {
        x: () => -getTravel(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getTravel()}`,
          scrub: true,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }, section);

    return () => ctx.revert();
  }, [cards, compact, reduced]);

  return (
    <section
      className={`horizontal-showcase ${reduced || compact ? "is-linear" : ""}`}
      ref={sectionRef}
    >
      <div className="horizontal-showcase-track" ref={trackRef}>
        <div className="horizontal-showcase-intro">
          <p className="horizontal-showcase-kicker">
            {lang === "en" ? "// CAPABILITY CARDS" : "// TARJETAS DE CAPACIDAD"}
          </p>
          <h2 className="horizontal-showcase-title">
            {lang === "en" ? "What I ship." : "Lo que entrego."}
          </h2>
          <p className="horizontal-showcase-sub">
            {lang === "en"
              ? "Scroll keeps advancing left while the section is pinned."
              : "El scroll sigue avanzando lateralmente mientras la sección está anclada."}
          </p>
        </div>

        {cards.map((card) => (
          <article className="horizontal-card" key={card.tag}>
            <span className="horizontal-card-tag">{card.tag}</span>
            <h3 className="horizontal-card-title">{card.title}</h3>
            <p className="horizontal-card-body">{card.body}</p>
            <span className="horizontal-card-chip">{card.chip}</span>
          </article>
        ))}

        <div className="horizontal-showcase-outro">
          <p>{lang === "en" ? "End of toolkit →" : "Fin del toolkit →"}</p>
        </div>
      </div>
    </section>
  );
}
