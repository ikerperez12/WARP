import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./HorizontalShowcase.css";

gsap.registerPlugin(ScrollTrigger);

const CARDS = {
  es: [
    {
      tag: "BACK·01",
      title: "Diseño de APIs REST",
      body: "Recursos, contratos, paginación, errores normalizados. Código que se lee el lunes a las 9.",
      chip: "Spring · FastAPI · Node",
    },
    {
      tag: "OPS·02",
      title: "Entornos reproducibles",
      body: "Imágenes Docker multi-stage, compose para dev, pipelines CI que fallan antes que producción.",
      chip: "Docker · GitHub Actions · Cloudflare",
    },
    {
      tag: "SEC·03",
      title: "Seguridad aplicada",
      body: "OWASP Top 10, validación de entrada, análisis de tráfico y trabajo con criptografía postcuántica.",
      chip: "Wireshark · PQC · TLS",
    },
    {
      tag: "DATA·04",
      title: "Persistencia con criterio",
      body: "PostgreSQL, modelado, índices, migrations. Saber cuándo SQL y cuándo documento.",
      chip: "PostgreSQL · MySQL · Redis",
    },
    {
      tag: "AUTO·05",
      title: "Automatización real",
      body: "Scripts que se usan, CLIs que se quedan, integración con modelos de IA cuando ayuda.",
      chip: "Python · LLM Ops · Playwright",
    },
    {
      tag: "WEB·06",
      title: "Frontend que entiende backend",
      body: "React + Three.js cuando hace falta, HTML semántico siempre, accesibilidad por defecto.",
      chip: "React · R3F · GSAP",
    },
  ],
  en: [
    {
      tag: "BACK·01",
      title: "REST API design",
      body: "Resources, contracts, pagination, normalized errors. Code that reads well on a Monday at 9.",
      chip: "Spring · FastAPI · Node",
    },
    {
      tag: "OPS·02",
      title: "Reproducible environments",
      body: "Multi-stage Docker, compose for dev, CI pipelines that fail before production does.",
      chip: "Docker · GitHub Actions · Cloudflare",
    },
    {
      tag: "SEC·03",
      title: "Applied security",
      body: "OWASP Top 10, input validation, traffic analysis and post-quantum cryptography work.",
      chip: "Wireshark · PQC · TLS",
    },
    {
      tag: "DATA·04",
      title: "Persistence with judgement",
      body: "PostgreSQL, modeling, indexes, migrations. Knowing when SQL and when document stores.",
      chip: "PostgreSQL · MySQL · Redis",
    },
    {
      tag: "AUTO·05",
      title: "Real automation",
      body: "Scripts that get used, CLIs that stick, AI model integration when it adds value.",
      chip: "Python · LLM Ops · Playwright",
    },
    {
      tag: "WEB·06",
      title: "Frontend that gets backend",
      body: "React + Three.js when needed, semantic HTML always, accessibility by default.",
      chip: "React · R3F · GSAP",
    },
  ],
};

export default function HorizontalShowcase() {
  const { lang } = useI18n();
  const cards = CARDS[lang];
  const ref = useRef(null);
  const trackRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const section = ref.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const total = track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: -total,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${total}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, [reduced, lang]);

  return (
    <section className="horizontal-showcase" ref={ref}>
      <div className="horizontal-showcase-track" ref={trackRef}>
        <div className="horizontal-showcase-intro">
          <p className="horizontal-showcase-kicker">{lang === "en" ? "// CAPABILITY CARDS" : "// TARJETAS DE CAPACIDAD"}</p>
          <h2 className="horizontal-showcase-title">
            {lang === "en" ? "What I ship." : "Lo que entrego."}
          </h2>
          <p className="horizontal-showcase-sub">
            {lang === "en"
              ? "Scroll to move laterally through the toolkit."
              : "Avanza scroll para recorrer el toolkit lateralmente."}
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
