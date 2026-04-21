import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./HorizontalShowcase.css";

gsap.registerPlugin(ScrollTrigger);

const ENTRY_SETTLE_VH = 14;
const EXIT_SETTLE_VH = 12;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mix = (from, to, progress) => from + (to - from) * progress;

const CARDS = {
  es: [
    {
      tag: "BACK-01",
      title: "Diseno de APIs REST",
      body: "Recursos, contratos, paginacion y errores normalizados. Codigo que se lee bien el lunes a las 9.",
      chip: "Spring · FastAPI · Node",
    },
    {
      tag: "OPS-02",
      title: "Entornos reproducibles",
      body: "Imagenes Docker multi-stage, compose para dev y pipelines CI que fallan antes que produccion.",
      chip: "Docker · GitHub Actions · CI",
    },
    {
      tag: "SEC-03",
      title: "Seguridad aplicada",
      body: "OWASP Top 10, validacion de entrada, analisis de trafico y trabajo con criptografia postcuantica.",
      chip: "Wireshark · PQC · TLS",
    },
    {
      tag: "DATA-04",
      title: "Persistencia con criterio",
      body: "PostgreSQL, modelado, indices y migraciones. Saber cuando SQL y cuando documento.",
      chip: "PostgreSQL · MySQL · Redis",
    },
    {
      tag: "AUTO-05",
      title: "Automatizacion real",
      body: "Scripts que se usan, CLIs que se quedan e integracion con modelos cuando aportan control.",
      chip: "Python · LLM Ops · Playwright",
    },
    {
      tag: "UX-06",
      title: "Interfaces utiles",
      body: "React cuando hace falta, HTML semantico siempre y una capa visual conectada con datos, no con adorno vacio.",
      chip: "React · TypeScript · Accesibilidad",
    },
  ],
  en: [
    {
      tag: "BACK-01",
      title: "REST API design",
      body: "Resources, contracts, pagination and normalized errors. Code that still reads well on a Monday at 9.",
      chip: "Spring · FastAPI · Node",
    },
    {
      tag: "OPS-02",
      title: "Reproducible environments",
      body: "Multi-stage Docker, compose for dev and CI pipelines that fail before production does.",
      chip: "Docker · GitHub Actions · CI",
    },
    {
      tag: "SEC-03",
      title: "Applied security",
      body: "OWASP Top 10, input validation, traffic analysis and post-quantum cryptography work.",
      chip: "Wireshark · PQC · TLS",
    },
    {
      tag: "DATA-04",
      title: "Persistence with judgement",
      body: "PostgreSQL, modeling, indexes and migrations. Knowing when SQL wins and when documents fit better.",
      chip: "PostgreSQL · MySQL · Redis",
    },
    {
      tag: "AUTO-05",
      title: "Real automation",
      body: "Scripts that get used, CLIs that stay and model integration when it improves control.",
      chip: "Python · LLM Ops · Playwright",
    },
    {
      tag: "UX-06",
      title: "Useful interfaces",
      body: "React when needed, semantic HTML by default and UI that stays connected to data rather than decoration.",
      chip: "React · TypeScript · Accessibility",
    },
  ],
};

export default function HorizontalShowcase() {
  const { lang } = useI18n();
  const cards = useMemo(() => CARDS[lang], [lang]);
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
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
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!section || !stage || !track) return;

    if (reduced || compact) {
      section.style.removeProperty("height");
      gsap.set(stage, { clearProps: "opacity,transform" });
      gsap.set(track, { clearProps: "transform" });
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return;
    }

    const ctx = gsap.context(() => {
      let travel = 0;
      let entry = 0;
      let exit = 0;
      let total = 0;

      const applyProgress = (offset) => {
        const x = clamp(offset - entry, 0, travel);
        const entryProgress = clamp(offset / Math.max(entry, 1), 0, 1);
        const exitProgress = clamp((offset - entry - travel) / Math.max(exit, 1), 0, 1);
        const stageOpacity = exitProgress > 0 ? 1 - exitProgress : mix(0.88, 1, entryProgress);
        const stageY = exitProgress > 0 ? mix(0, -10, exitProgress) : mix(10, 0, entryProgress);

        gsap.set(stage, { autoAlpha: stageOpacity, yPercent: stageY });
        gsap.set(track, { x: -x });
      };

      const measure = () => {
        const vh = window.innerHeight;
        travel = Math.max(0, Math.ceil(track.scrollWidth - stage.clientWidth));
        entry = Math.round((vh * ENTRY_SETTLE_VH) / 100);
        exit = Math.round((vh * EXIT_SETTLE_VH) / 100);
        total = entry + travel + exit;
        section.style.height = `${vh + total}px`;
      };

      measure();

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${Math.max(total, 1)}`,
        invalidateOnRefresh: true,
        onRefreshInit: measure,
        onRefresh: (self) => {
          applyProgress(self.progress * total);
        },
        onUpdate: (self) => {
          applyProgress(self.progress * total);
        },
      });

      const onResize = () => {
        trigger.refresh();
      };

      window.addEventListener("resize", onResize);
      applyProgress(0);

      return () => {
        window.removeEventListener("resize", onResize);
        trigger.kill();
        section.style.removeProperty("height");
        gsap.set(stage, { clearProps: "opacity,transform" });
        gsap.set(track, { clearProps: "transform" });
      };
    }, section);

    return () => ctx.revert();
  }, [cards, compact, reduced]);

  return (
    <section
      className={`horizontal-showcase ${reduced || compact ? "is-linear" : ""}`}
      ref={sectionRef}
    >
      <div className="horizontal-showcase-stage" ref={stageRef}>
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
                ? "A single lateral sequence: no double entry, no fake second pass."
                : "Una unica secuencia lateral: sin doble entrada ni segunda pasada falsa."}
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
            <p>{lang === "en" ? "End of sequence →" : "Fin de secuencia →"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
