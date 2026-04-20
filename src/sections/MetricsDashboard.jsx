import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import "./MetricsDashboard.css";

const METRICS = {
  es: [
    { value: 4, suffix: "+", label: "Años de formación", sub: "Grado Ing. Informática · UDC" },
    { value: 3, suffix: "", label: "Idiomas de trabajo", sub: "ES / GL nativo · EN B2" },
    { value: 12, suffix: "+", label: "Repositorios públicos", sub: "github.com/ikerperez12" },
    { value: 6, suffix: "", label: "Áreas con autonomía", sub: "Backend · Sistemas · Seguridad · Data · Cloud · Tooling" },
  ],
  en: [
    { value: 4, suffix: "+", label: "Years of training", sub: "Computer Engineering · UDC" },
    { value: 3, suffix: "", label: "Working languages", sub: "ES / GL native · EN B2" },
    { value: 12, suffix: "+", label: "Public repositories", sub: "github.com/ikerperez12" },
    { value: 6, suffix: "", label: "Areas with autonomy", sub: "Backend · Systems · Security · Data · Cloud · Tooling" },
  ],
};

function useCountUp(target, duration = 1400, start) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf;
    const t0 = performance.now();
    const loop = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return n;
}

function MetricCard({ metric, active }) {
  const n = useCountUp(metric.value, 1400, active);
  return (
    <article className="metric-card">
      <div className="metric-card-glow" aria-hidden="true" />
      <div className="metric-card-value">
        <span className="metric-card-num">{n}</span>
        <span className="metric-card-suffix">{metric.suffix}</span>
      </div>
      <div className="metric-card-label">{metric.label}</div>
      <div className="metric-card-sub">{metric.sub}</div>
    </article>
  );
}

export default function MetricsDashboard() {
  const { lang } = useI18n();
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setActive(true);
      },
      { threshold: 0.35 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const metrics = METRICS[lang];
  return (
    <div ref={ref}>
      <SectionFrame
        id="metrics"
        kicker={lang === "en" ? "At a glance" : "De un vistazo"}
        title={lang === "en" ? "Numbers behind the profile." : "Números detrás del perfil."}
        subtitle={
          lang === "en"
            ? "Four-year Computer Engineering degree, exchange at UPM, multiple ongoing personal and academic projects. Looking for my first junior / internship role."
            : "Cuatro años de Ingeniería Informática, intercambio en UPM, múltiples proyectos personales y académicos en curso. Buscando mis primeras prácticas / puesto junior."
        }
        className="metrics-section"
      >
        <div className="metrics-grid">
          {metrics.map((m) => (
            <MetricCard key={m.label} metric={m} active={active} />
          ))}
        </div>
      </SectionFrame>
    </div>
  );
}
