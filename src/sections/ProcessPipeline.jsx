import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import "./ProcessPipeline.css";

const STEPS = {
  es: [
    {
      n: "01",
      title: "Leer el problema",
      body: "Entender la necesidad real antes de escribir código. Preguntas, diagramas y contrato técnico explícito con los interesados.",
      detail: "Requisitos · Contratos · Riesgos",
    },
    {
      n: "02",
      title: "Diseñar en pequeño",
      body: "Arquitectura que soporta el segundo cambio de requisitos. Separación por capas, interfaces claras, tests como parte del diseño.",
      detail: "Arquitectura · Modelado · Interfaces",
    },
    {
      n: "03",
      title: "Implementar con rigor",
      body: "Código legible el lunes a las 9. Validación de entradas, logs útiles, control de errores, observabilidad básica desde el primer commit.",
      detail: "Código · Tests · Logs · CI",
    },
    {
      n: "04",
      title: "Entregar e iterar",
      body: "Deploy reproducible, smoke tests, feedback de operación. Próxima vuelta: medir, revisar, mejorar sin romper lo que funciona.",
      detail: "Deploy · Métricas · Iteración",
    },
  ],
  en: [
    {
      n: "01",
      title: "Read the problem",
      body: "Understand the real need before writing any code. Questions, diagrams and an explicit technical contract with stakeholders.",
      detail: "Requirements · Contracts · Risks",
    },
    {
      n: "02",
      title: "Design small",
      body: "Architecture that survives the second requirements change. Layered separation, clear interfaces, tests as part of design.",
      detail: "Architecture · Modeling · Interfaces",
    },
    {
      n: "03",
      title: "Implement with rigor",
      body: "Code that reads cleanly on a Monday at 9am. Input validation, useful logs, error handling, basic observability from the first commit.",
      detail: "Code · Tests · Logs · CI",
    },
    {
      n: "04",
      title: "Ship and iterate",
      body: "Reproducible deploy, smoke tests, operations feedback. Next pass: measure, review, improve without breaking what works.",
      detail: "Deploy · Metrics · Iteration",
    },
  ],
};

export default function ProcessPipeline() {
  const { lang } = useI18n();
  const steps = STEPS[lang];
  return (
    <SectionFrame
      id="process"
      kicker={lang === "en" ? "How I work" : "Cómo trabajo"}
      title={lang === "en" ? "Four steps, repeated with care." : "Cuatro pasos, repetidos con cuidado."}
      subtitle={
        lang === "en"
          ? "I treat each feature as a small engineering project. Less mythology, more craft. This is the loop I run — and the one I'd run inside your team."
          : "Trato cada feature como un pequeño proyecto de ingeniería. Menos mitología, más oficio. Éste es el bucle que aplico — y el que aplicaría dentro de tu equipo."
      }
      className="process-section"
    >
      <ol className="process-list">
        <div className="process-rail" aria-hidden="true" />
        {steps.map((step, i) => (
          <li key={step.n} className="process-step" style={{ "--i": i }}>
            <div className="process-step-marker">
              <span className="process-step-n">{step.n}</span>
              <span className="process-step-dot" />
            </div>
            <article className="process-step-card">
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <span className="process-step-detail">{step.detail}</span>
            </article>
          </li>
        ))}
      </ol>
    </SectionFrame>
  );
}
