import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import Magnetic from "../visuals/Magnetic.jsx";
import "./ServicesSection.css";

const SERVICES = {
  es: [
    {
      tag: "01",
      icon: "◆",
      title: "Arquitectura backend",
      body: "Diseño servicios REST limpios, con contratos explícitos, separación de capas y testing como parte del diseño. Java (Spring), Python (FastAPI), Node.",
      chips: ["Java", "Spring", "FastAPI", "PostgreSQL", "REST"],
    },
    {
      tag: "02",
      icon: "◈",
      title: "Linux · Docker · DevOps",
      body: "Entornos reproducibles, pipelines CI/CD, infraestructura como código y automatización de despliegues. Sé moverme en terminal, logs y operación diaria.",
      chips: ["Linux", "Docker", "Bash", "GitHub Actions", "Cloudflare"],
    },
    {
      tag: "03",
      icon: "◉",
      title: "Seguridad aplicada",
      body: "Criptografía postcuántica, análisis de tráfico, hardening, validación de entrada y lectura técnica del riesgo durante implementación — no solo al final.",
      chips: ["PQC", "Wireshark", "OWASP", "Auditoría", "TLS"],
    },
    {
      tag: "04",
      icon: "◊",
      title: "Automatización · Tooling",
      body: "CLIs personalizadas, integración de modelos de IA cuando aportan control, scripts que ahorran horas. Hago tooling que se queda en producción.",
      chips: ["Python CLI", "LLM Ops", "GitHub API", "GSAP", "Playwright"],
    },
  ],
  en: [
    {
      tag: "01",
      icon: "◆",
      title: "Backend architecture",
      body: "Clean REST services, explicit contracts, layered separation, testing as part of design. Java (Spring), Python (FastAPI), Node.",
      chips: ["Java", "Spring", "FastAPI", "PostgreSQL", "REST"],
    },
    {
      tag: "02",
      icon: "◈",
      title: "Linux · Docker · DevOps",
      body: "Reproducible environments, CI/CD pipelines, infra as code, deployment automation. At home in terminal, logs and day-to-day ops.",
      chips: ["Linux", "Docker", "Bash", "GitHub Actions", "Cloudflare"],
    },
    {
      tag: "03",
      icon: "◉",
      title: "Applied security",
      body: "Post-quantum cryptography, traffic analysis, hardening, input validation, technical risk reading during implementation — not just at the end.",
      chips: ["PQC", "Wireshark", "OWASP", "Audit", "TLS"],
    },
    {
      tag: "04",
      icon: "◊",
      title: "Automation · Tooling",
      body: "Custom CLIs, AI model integration when it helps control, scripts that save hours. I build tooling that sticks around in production.",
      chips: ["Python CLI", "LLM Ops", "GitHub API", "GSAP", "Playwright"],
    },
  ],
};

export default function ServicesSection() {
  const { lang, t } = useI18n();
  const services = SERVICES[lang];
  return (
    <SectionFrame
      id="services"
      kicker={lang === "en" ? "What I build" : "Lo que construyo"}
      title={lang === "en" ? "Capabilities with production-grade care" : "Capacidades con cuidado de producción"}
      subtitle={lang === "en"
        ? "Four core lanes where I can move with real autonomy — each backed by academic foundation, personal projects and continuous lab work."
        : "Cuatro carriles donde puedo moverme con autonomía real — cada uno apoyado en base académica, proyectos personales y laboratorio continuo."}
      className="services-section"
    >
      <div className="services-grid">
        {services.map((svc) => (
          <Magnetic key={svc.tag} strength={0.08}>
            <article className="service-card">
              <div className="service-card-glow" aria-hidden="true" />
              <header className="service-card-header">
                <span className="service-card-icon" aria-hidden="true">{svc.icon}</span>
                <span className="service-card-tag">{svc.tag}</span>
              </header>
              <h3 className="service-card-title">{svc.title}</h3>
              <p className="service-card-body">{svc.body}</p>
              <div className="service-card-chips">
                {svc.chips.map((chip) => (
                  <span key={chip} className="service-card-chip">{chip}</span>
                ))}
              </div>
            </article>
          </Magnetic>
        ))}
      </div>
    </SectionFrame>
  );
}
