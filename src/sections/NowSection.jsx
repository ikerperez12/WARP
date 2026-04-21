import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import "./NowSection.css";

const NOW = {
  es: {
    kicker: "Estado actual · " + new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" }),
    title: "En qué estoy ahora mismo.",
    subtitle:
      "Una instantánea viva del foco de la semana. Actualizo esta sección en cada push importante para que quien mira el portfolio vea trabajo reciente, no solo histórico.",
    items: [
      {
        status: "active",
        label: "EN CURSO",
        head: "Auditoría PQC · Análisis de handshakes TLS 1.3",
        body: "Capturando tráfico con Wireshark y comparando suites clásicas vs ML-KEM / Dilithium en escenarios híbridos. Documento técnico en curso con hallazgos y recomendaciones.",
      },
      {
        status: "active",
        label: "EN CURSO",
        head: "ISD · Capa de persistencia sobre PostgreSQL",
        body: "Migrations reproducibles, repositorios con contratos explícitos, tests de integración con Testcontainers. Objetivo: servicio que pueda desplegarse en CI sin intervención manual.",
      },
      {
        status: "learning",
        label: "APRENDIENDO",
        head: "Rust · Ownership y async",
        body: "Estoy pasando un par de módulos sencillos de Python a Rust para entender ownership, borrowing y async en casos reales. No profesional aún, pero acumulando criterio.",
      },
    ],
  },
  en: {
    kicker:
      "Current status · " +
      new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    title: "What I'm on right now.",
    subtitle:
      "A living snapshot of the week's focus. I refresh this on every significant push, so whoever lands here sees recent work, not just history.",
    items: [
      {
        status: "active",
        label: "IN PROGRESS",
        head: "PQC Audit · TLS 1.3 handshake analysis",
        body: "Capturing traffic with Wireshark and comparing classical suites vs ML-KEM / Dilithium in hybrid scenarios. Technical report in progress with findings and recommendations.",
      },
      {
        status: "active",
        label: "IN PROGRESS",
        head: "ISD · PostgreSQL persistence layer",
        body: "Reproducible migrations, repositories with explicit contracts, integration tests with Testcontainers. Goal: a service that can deploy in CI without manual intervention.",
      },
      {
        status: "learning",
        label: "LEARNING",
        head: "Rust · Ownership and async",
        body: "Porting a couple of small Python modules to Rust to understand ownership, borrowing and async in real cases. Not professional yet, but building judgment.",
      },
    ],
  },
};

export default function NowSection() {
  const { lang } = useI18n();
  const c = NOW[lang];
  return (
    <SectionFrame
      id="now"
      kicker={c.kicker}
      title={c.title}
      subtitle={c.subtitle}
      className="now-section"
    >
      <ul className="now-list">
        {c.items.map((item, i) => (
          <li key={i} className={`now-item now-item-${item.status}`}>
            <div className="now-item-status">
              <span className="now-item-pulse" aria-hidden="true" />
              <span className="now-item-label">{item.label}</span>
            </div>
            <h3 className="now-item-head">{item.head}</h3>
            <p className="now-item-body">{item.body}</p>
          </li>
        ))}
      </ul>
    </SectionFrame>
  );
}
