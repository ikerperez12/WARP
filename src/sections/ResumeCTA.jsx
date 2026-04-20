import { useI18n } from "../i18n/I18nProvider.jsx";
import { CONTACT_INFO } from "../i18n/copy.js";
import Magnetic from "../visuals/Magnetic.jsx";
import "./ResumeCTA.css";

export default function ResumeCTA() {
  const { lang } = useI18n();
  const es = lang === "es";

  return (
    <section id="resume-cta" className="resume-cta">
      <div className="resume-cta-inner">
        <div className="resume-cta-glow" aria-hidden="true" />

        <div className="resume-cta-body">
          <p className="resume-cta-kicker">
            {es ? "// SIGUIENTE PASO" : "// NEXT STEP"}
          </p>
          <h2 className="resume-cta-title">
            {es ? (
              <>Llévame a tu<br />siguiente sprint.</>
            ) : (
              <>Bring me into your<br />next sprint.</>
            )}
          </h2>
          <p className="resume-cta-sub">
            {es
              ? "CV técnico en PDF + enlaces directos. Una respuesta por email o LinkedIn basta para arrancar la conversación."
              : "Technical CV as PDF + direct links. A reply by email or LinkedIn is enough to start the conversation."}
          </p>
        </div>

        <div className="resume-cta-actions">
          <Magnetic strength={0.25}>
            <a
              href={`mailto:${CONTACT_INFO.email}?subject=${encodeURIComponent(
                es ? "Iker Pérez — Portfolio" : "Iker Pérez — Portfolio"
              )}`}
              className="resume-cta-btn resume-cta-btn-primary"
            >
              <span>{es ? "Escribir email" : "Send email"}</span>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M5 12h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </a>
          </Magnetic>

          <Magnetic strength={0.2}>
            <a
              href={CONTACT_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="resume-cta-btn resume-cta-btn-ghost"
            >
              <span>LinkedIn</span>
            </a>
          </Magnetic>

          <Magnetic strength={0.2}>
            <a
              href={CONTACT_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="resume-cta-btn resume-cta-btn-ghost"
            >
              <span>GitHub</span>
            </a>
          </Magnetic>
        </div>

        <div className="resume-cta-facts">
          <div className="resume-cta-fact">
            <span className="resume-cta-fact-label">{es ? "Email" : "Email"}</span>
            <span className="resume-cta-fact-value">{CONTACT_INFO.email}</span>
          </div>
          <div className="resume-cta-fact">
            <span className="resume-cta-fact-label">{es ? "Ubicación" : "Location"}</span>
            <span className="resume-cta-fact-value">A Coruña · Remoto</span>
          </div>
          <div className="resume-cta-fact">
            <span className="resume-cta-fact-label">{es ? "Respuesta" : "Reply time"}</span>
            <span className="resume-cta-fact-value">&lt; 24 h</span>
          </div>
          <div className="resume-cta-fact">
            <span className="resume-cta-fact-label">{es ? "Idiomas" : "Languages"}</span>
            <span className="resume-cta-fact-value">ES · GL · EN</span>
          </div>
        </div>
      </div>
    </section>
  );
}
