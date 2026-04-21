import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import "./AchievementsSection.css";

const DATA = {
  es: {
    kicker: "Formación activa · Reconocimientos",
    title: "Lo que consolida la base.",
    subtitle:
      "Méritos académicos, becas, movilidad internacional y certificaciones que apoyan el perfil técnico. No marketing: evidencia.",
    items: [
      {
        icon: "★",
        label: "Movilidad SICUE",
        value: "ETSISI · UPM",
        sub: "Beca de intercambio nacional · Curso 2025-26",
        accent: "magenta",
      },
      {
        icon: "◆",
        label: "Grado activo",
        value: "Ing. Informática",
        sub: "Universidade da Coruña · Trayecto 2022-presente",
        accent: "cyan",
      },
      {
        icon: "✓",
        label: "Idiomas",
        value: "EN B2",
        sub: "Lectura técnica, reuniones y PRs en inglés diario",
        accent: "purple",
      },
      {
        icon: "◉",
        label: "Lab seguridad",
        value: "PQC + traffic",
        sub: "Trabajo tutelado con criptografía postcuántica 2024-25",
        accent: "neon",
      },
      {
        icon: "⟐",
        label: "GitHub",
        value: "@ikerperez12",
        sub: "Repositorios académicos y personales públicos, commits semanales",
        accent: "magenta",
        href: "https://github.com/ikerperez12",
      },
      {
        icon: "◇",
        label: "Formación continua",
        value: "Self-driven",
        sub: "Rust, Kubernetes, AWS, LLM Ops fuera del currículo universitario",
        accent: "cyan",
      },
    ],
  },
  en: {
    kicker: "Active training · Recognitions",
    title: "What anchors the foundation.",
    subtitle:
      "Academic merits, scholarships, international mobility and certifications that support the technical profile. No marketing: evidence.",
    items: [
      {
        icon: "★",
        label: "SICUE mobility",
        value: "ETSISI · UPM",
        sub: "National exchange grant · 2025-26 academic year",
        accent: "magenta",
      },
      {
        icon: "◆",
        label: "Active degree",
        value: "Computer Eng.",
        sub: "Universidade da Coruña · Track 2022-present",
        accent: "cyan",
      },
      {
        icon: "✓",
        label: "Languages",
        value: "EN B2",
        sub: "Technical reading, meetings and PRs in English daily",
        accent: "purple",
      },
      {
        icon: "◉",
        label: "Security lab",
        value: "PQC + traffic",
        sub: "Supervised work on post-quantum cryptography 2024-25",
        accent: "neon",
      },
      {
        icon: "⟐",
        label: "GitHub",
        value: "@ikerperez12",
        sub: "Public academic and personal repositories, weekly commits",
        accent: "magenta",
        href: "https://github.com/ikerperez12",
      },
      {
        icon: "◇",
        label: "Continuous learning",
        value: "Self-driven",
        sub: "Rust, Kubernetes, AWS, LLM Ops outside the university syllabus",
        accent: "cyan",
      },
    ],
  },
};

export default function AchievementsSection() {
  const { lang } = useI18n();
  const c = DATA[lang];
  return (
    <SectionFrame
      id="achievements"
      kicker={c.kicker}
      title={c.title}
      subtitle={c.subtitle}
      className="achievements-section"
    >
      <div className="achievements-grid">
        {c.items.map((item, i) => {
          const Wrapper = item.href ? "a" : "div";
          return (
            <Wrapper
              key={i}
              className={`achievement-card achievement-${item.accent}`}
              {...(item.href ? { href: item.href, target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <span className="achievement-icon" aria-hidden="true">{item.icon}</span>
              <span className="achievement-label">{item.label}</span>
              <span className="achievement-value">{item.value}</span>
              <span className="achievement-sub">{item.sub}</span>
            </Wrapper>
          );
        })}
      </div>
    </SectionFrame>
  );
}
