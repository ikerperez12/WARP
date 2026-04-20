import { useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import "./FAQSection.css";

const QUESTIONS = {
  es: [
    {
      q: "¿Cuándo puedes incorporarte?",
      a: "Disponible desde este curso académico para prácticas curriculares o extracurriculares, y desde verano 2026 para puesto junior a tiempo completo. Flexibilidad con horarios compatibles con la universidad.",
    },
    {
      q: "¿Modalidad presencial, remota o híbrida?",
      a: "A Coruña presencial preferido, pero totalmente abierto a remoto o híbrido con cualquier equipo español o europeo. Dispongo de espacio de trabajo propio con buena conexión.",
    },
    {
      q: "¿Qué tipo de equipo te encaja?",
      a: "Equipos pequeños o medianos donde pueda aprender de seniors, pero con autonomía para ejecutar desde el primer sprint. Valoro code review serio, testing real y entorno de aprendizaje continuo.",
    },
    {
      q: "¿Qué stack dominas desde producción?",
      a: "Java + Spring, Python + FastAPI, PostgreSQL, Docker y Linux en terminal. Git + GitHub Actions de forma diaria. En aprendizaje activo: Kubernetes, Rust, arquitecturas cloud en AWS y Cloudflare.",
    },
    {
      q: "¿Qué nivel de inglés tienes?",
      a: "B2 acreditado, suficiente para reuniones técnicas, lectura de documentación y Pull Requests en inglés. Lo uso a diario para formación y proyectos open source.",
    },
    {
      q: "¿Puedes enseñar código o hablar de proyectos previos?",
      a: "Sí. GitHub público (github.com/ikerperez12) con proyectos académicos y personales reales. Disponible para entrevista técnica, pair programming o revisión conjunta de cualquier repositorio.",
    },
  ],
  en: [
    {
      q: "When can you start?",
      a: "Available this academic year for curricular or extracurricular internships, and from summer 2026 for a full-time junior role. Flexible with university-compatible schedules.",
    },
    {
      q: "On-site, remote or hybrid?",
      a: "A Coruña on-site preferred, but fully open to remote or hybrid with any Spanish or European team. I have a proper home workspace with reliable connection.",
    },
    {
      q: "What kind of team suits you?",
      a: "Small or mid-size teams where I can learn from seniors, with autonomy to execute from the first sprint. I value serious code review, real testing and a continuous learning environment.",
    },
    {
      q: "Which stack do you own in production?",
      a: "Java + Spring, Python + FastAPI, PostgreSQL, Docker and Linux in terminal. Git + GitHub Actions daily. Actively learning: Kubernetes, Rust, AWS and Cloudflare cloud architectures.",
    },
    {
      q: "English level?",
      a: "B2 certified, enough for technical meetings, reading documentation and Pull Requests in English. I use it daily for training and open source.",
    },
    {
      q: "Can you show code or discuss past projects?",
      a: "Yes. Public GitHub (github.com/ikerperez12) with real academic and personal projects. Available for technical interview, pair programming or joint review of any repository.",
    },
  ],
};

export default function FAQSection() {
  const { lang } = useI18n();
  const questions = QUESTIONS[lang];
  const [open, setOpen] = useState(0);

  return (
    <SectionFrame
      id="faq"
      kicker={lang === "en" ? "Questions usually asked" : "Preguntas que suelen hacerme"}
      title={lang === "en" ? "The honest FAQ." : "El FAQ sin rodeos."}
      subtitle={
        lang === "en"
          ? "Answers to the six questions recruiters and hiring managers ask most often. No fluff."
          : "Respuestas a las seis preguntas más frecuentes de reclutadores y responsables técnicos. Sin adornos."
      }
      className="faq-section"
    >
      <div className="faq-list" role="list">
        {questions.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className={`faq-item ${isOpen ? "is-open" : ""}`} role="listitem">
              <button
                type="button"
                className="faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="faq-q-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="faq-q-text">{item.q}</span>
                <span className="faq-q-icon" aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
              <div className="faq-a-wrap" aria-hidden={!isOpen}>
                <div className="faq-a-inner">
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionFrame>
  );
}
