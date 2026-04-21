import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import "./CaseStudy.css";

const CASE = {
  es: {
    kicker: "Proyecto destacado · Case study",
    title: "ISD — Internet y Sistemas Distribuidos.",
    subtitle:
      "Proyecto académico trabajado con profundidad técnica real: diseño backend, persistencia, despliegue reproducible y separación por capas. Un ejercicio completo de ingeniería más que una simple entrega.",
    blocks: [
      {
        label: "PROBLEMA",
        head: "Partir de un enunciado ambiguo a un sistema operable",
        body: "El enunciado original describía múltiples servicios que debían comunicarse, persistir datos y desplegarse sin asumir un entorno concreto. Faltaba traducirlo a interfaces claras y contratos estables.",
      },
      {
        label: "DECISIONES",
        head: "Java + PostgreSQL + Docker · Separación por capas",
        body: "Capa de dominio sin dependencias externas, repositorios con interfaces explícitas, servicio aplicación orquestando casos de uso, infraestructura aislada en adaptadores. Docker Compose para el entorno completo.",
      },
      {
        label: "ENTREGA",
        head: "Contratos REST, migrations controladas, CI que falla antes que prod",
        body: "Endpoints con respuestas tipadas, errores normalizados. Migrations versionadas. Pipeline de CI que monta Docker y corre tests de integración antes de aprobar el merge.",
      },
      {
        label: "APRENDIZAJES",
        head: "El test de integración paga todas las mentiras del test unitario",
        body: "Los unitarios pasaban y la comunicación real entre servicios fallaba. Incorporar Testcontainers en CI cambió el criterio: probar con PostgreSQL real captura errores de SQL, timeouts y transacciones que mocks nunca verían.",
      },
    ],
    stats: [
      { v: "4", l: "Servicios" },
      { v: "12+", l: "Endpoints" },
      { v: "100%", l: "Reproducible" },
      { v: "CI", l: "Green" },
    ],
    stack: ["Java", "Spring", "PostgreSQL", "Docker", "REST", "JUnit", "Testcontainers", "GitHub Actions"],
  },
  en: {
    kicker: "Flagship project · Case study",
    title: "ISD — Internet and Distributed Systems.",
    subtitle:
      "Academic project pushed with real engineering depth: backend design, persistence, reproducible deployment and layered separation. A full engineering exercise rather than a submission.",
    blocks: [
      {
        label: "PROBLEM",
        head: "From an ambiguous brief to an operable system",
        body: "The original brief described several services that had to communicate, persist data and deploy without assuming a specific environment. It needed translation into clear interfaces and stable contracts.",
      },
      {
        label: "DECISIONS",
        head: "Java + PostgreSQL + Docker · Layered separation",
        body: "Domain layer with no external dependencies, repositories with explicit interfaces, application service orchestrating use cases, infrastructure isolated in adapters. Docker Compose for the full environment.",
      },
      {
        label: "DELIVERY",
        head: "REST contracts, controlled migrations, CI that fails before prod does",
        body: "Endpoints with typed responses, normalized errors. Versioned migrations. CI pipeline spinning up Docker and running integration tests before approving the merge.",
      },
      {
        label: "LESSONS",
        head: "Integration tests pay every debt unit tests leave behind",
        body: "Unit tests passed and actual service-to-service communication failed. Bringing Testcontainers into CI shifted the criterion: testing against a real PostgreSQL catches SQL, timeouts and transaction bugs mocks never would.",
      },
    ],
    stats: [
      { v: "4", l: "Services" },
      { v: "12+", l: "Endpoints" },
      { v: "100%", l: "Reproducible" },
      { v: "CI", l: "Green" },
    ],
    stack: ["Java", "Spring", "PostgreSQL", "Docker", "REST", "JUnit", "Testcontainers", "GitHub Actions"],
  },
};

export default function CaseStudy() {
  const { lang } = useI18n();
  const c = CASE[lang];
  return (
    <SectionFrame
      id="case-study"
      kicker={c.kicker}
      title={c.title}
      subtitle={c.subtitle}
      className="case-section"
    >
      <div className="case-stats">
        {c.stats.map((s, i) => (
          <div key={i} className="case-stat">
            <span className="case-stat-v">{s.v}</span>
            <span className="case-stat-l">{s.l}</span>
          </div>
        ))}
      </div>

      <ol className="case-blocks">
        {c.blocks.map((b, i) => (
          <li key={i} className="case-block" style={{ "--i": i }}>
            <div className="case-block-tag">
              <span className="case-block-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="case-block-label">{b.label}</span>
            </div>
            <div className="case-block-body">
              <h3>{b.head}</h3>
              <p>{b.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <footer className="case-stack">
        <span className="case-stack-label">{lang === "en" ? "Technical stack" : "Stack técnico"}</span>
        <div className="case-stack-chips">
          {c.stack.map((t) => (
            <span key={t} className="case-stack-chip">{t}</span>
          ))}
        </div>
        <a
          href="https://github.com/ikerperez12/ISD"
          target="_blank"
          rel="noopener noreferrer"
          className="case-stack-cta"
        >
          <span>{lang === "en" ? "Repository on GitHub" : "Repositorio en GitHub"}</span>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="M7 17L17 7M7 7h10v10" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </a>
      </footer>
    </SectionFrame>
  );
}
