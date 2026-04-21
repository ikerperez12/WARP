import { useEffect } from "react";
import LanguageToggle from "./components/LanguageToggle.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import LiquidMetalTransition from "./visuals/LiquidMetalTransition.jsx";
import FrutigerAeroStage from "./visuals/FrutigerAeroStage.jsx";
import { useI18n } from "./i18n/I18nProvider.jsx";
import { CONTACT_INFO } from "./i18n/copy.js";
import "./VisualsPage.css";

const COPY = {
  es: {
    kicker: "Subpagina inmersiva",
    title: "Visuals.",
    description:
      "Dos piezas visuales separadas de la home principal para conservar calidad alta sin penalizar la navegacion general del portfolio.",
    primary: "Volver al portfolio",
    secondary: "Ir a contacto",
    sections: [
      {
        kicker: "Metal fluido",
        title: "Liquid Metal Transition",
        body:
          "Estudio de material cromado, refraccion, reflejos y tipografia flotante. Esta pieza vive fuera de la home para sostener mayor densidad visual con mejor margen de carga.",
      },
      {
        kicker: "Burbujas y tech",
        title: "Frutiger Aero Stage",
        body:
          "Escena de burbujas con iconografia tecnologica encapsulada, fondo atmosférico y glass rendering dedicado. Aqui puede mantenerse con mas presencia sin romper el ritmo del portfolio principal.",
      },
    ],
    footer: "Visuals dedicados · Home ligera · Misma identidad",
  },
  en: {
    kicker: "Immersive subpage",
    title: "Visuals.",
    description:
      "Two visual studies moved out of the main home so they can keep higher quality without slowing down the core portfolio experience.",
    primary: "Back to portfolio",
    secondary: "Jump to contact",
    sections: [
      {
        kicker: "Fluid metal",
        title: "Liquid Metal Transition",
        body:
          "A study in chrome material, refraction, reflections and floating typography. It lives outside the home so it can carry more visual density with a cleaner load profile.",
      },
      {
        kicker: "Bubbles and tech",
        title: "Frutiger Aero Stage",
        body:
          "A bubble scene with encapsulated technology iconography, atmospheric background and dedicated glass rendering. Here it can stay richer without breaking the rhythm of the main portfolio.",
      },
    ],
    footer: "Dedicated visuals · Lighter home · Same identity",
  },
};

export default function VisualsPage() {
  const { lang } = useI18n();
  const c = COPY[lang];

  useEffect(() => {
    document.title = lang === "en" ? "Iker Perez Garcia | Visuals" : "Iker Perez Garcia | Visuals";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", c.description);
  }, [c.description, lang]);

  return (
    <div className="visuals-page">
      <header className="visuals-page-header">
        <a href="/" className="visuals-page-brand" aria-label="Iker Perez Garcia">
          <span className="brand-bracket">{"<"}</span>
          <span className="brand-initials">IP</span>
          <span className="brand-bracket">{"/>"}</span>
        </a>

        <div className="visuals-page-actions">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="visuals-page-main">
        <section className="visuals-hero">
          <p className="visuals-hero-kicker">{c.kicker}</p>
          <h1 className="visuals-hero-title">{c.title}</h1>
          <p className="visuals-hero-description">{c.description}</p>

          <div className="visuals-hero-cta">
            <a href="/" className="visuals-link visuals-link-primary">
              {c.primary}
            </a>
            <a href={`/#contact`} className="visuals-link visuals-link-secondary">
              {c.secondary}
            </a>
          </div>
        </section>

        <section className="visuals-copy-block" id="liquid">
          <p className="visuals-block-kicker">{c.sections[0].kicker}</p>
          <h2 className="visuals-block-title">{c.sections[0].title}</h2>
          <p className="visuals-block-body">{c.sections[0].body}</p>
        </section>
        <LiquidMetalTransition title="LIQUID METAL" subtitle="Chrome, refraction and controlled highlight bloom" />

        <section className="visuals-copy-block" id="frutiger">
          <p className="visuals-block-kicker">{c.sections[1].kicker}</p>
          <h2 className="visuals-block-title">{c.sections[1].title}</h2>
          <p className="visuals-block-body">{c.sections[1].body}</p>
        </section>
        <FrutigerAeroStage
          kicker="Frutiger Aero"
          title="Bubbles, icons and glass depth"
          subtitle="Dedicated atmosphere, richer motion and isolated rendering budget."
        />
      </main>

      <footer className="visuals-page-footer">
        <p>{c.footer}</p>
        <div className="visuals-page-footer-links">
          <a href={`mailto:${CONTACT_INFO.email}`}>Email</a>
          <a href={CONTACT_INFO.github} target="_blank" rel="noreferrer noopener">GitHub</a>
          <a href={CONTACT_INFO.linkedin} target="_blank" rel="noreferrer noopener">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}
