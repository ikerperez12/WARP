import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import "./PrinciplesSection.css";

const PRINCIPLES = {
  es: [
    {
      n: "01",
      head: "El código se lee más veces de las que se escribe",
      body: "Prefiero claridad antes que ingenio. Nombres explícitos, funciones cortas y comentarios donde el porqué no es obvio.",
    },
    {
      n: "02",
      head: "Entregar es parte del diseño",
      body: "Un servicio sin deploy reproducible no existe. Docker, CI, rollback y logs útiles desde el primer commit.",
    },
    {
      n: "03",
      head: "Validar la entrada, siempre",
      body: "Todo dato que cruza una frontera (API, DB, usuario) se valida explícitamente. Menos sorpresas, menos incidentes.",
    },
    {
      n: "04",
      head: "Tests donde duelen los bugs",
      body: "No persigo 100% de cobertura. Persigo tests en los puntos donde una regresión silenciosa cuesta dinero o tiempo.",
    },
    {
      n: "05",
      head: "Preguntar antes que asumir",
      body: "Requisitos ambiguos se aclaran con el dueño del producto, no se inventan. Reduce retrabajo y malentendidos.",
    },
    {
      n: "06",
      head: "Operar lo que construyo",
      body: "No termino cuando el PR se mergea. Observo métricas, reviso logs y cierro el feedback loop en siguientes iteraciones.",
    },
  ],
  en: [
    {
      n: "01",
      head: "Code is read more than it's written",
      body: "I prefer clarity over cleverness. Explicit names, short functions and comments where the why isn't obvious.",
    },
    {
      n: "02",
      head: "Shipping is part of the design",
      body: "A service without reproducible deploys doesn't exist. Docker, CI, rollback and useful logs from the first commit.",
    },
    {
      n: "03",
      head: "Validate the input, always",
      body: "Any data crossing a boundary (API, DB, user) gets validated explicitly. Fewer surprises, fewer incidents.",
    },
    {
      n: "04",
      head: "Tests where bugs hurt",
      body: "I don't chase 100% coverage. I chase tests at points where a silent regression costs money or time.",
    },
    {
      n: "05",
      head: "Ask before assuming",
      body: "Ambiguous requirements are clarified with the product owner, not invented. Reduces rework and misunderstandings.",
    },
    {
      n: "06",
      head: "Operate what I build",
      body: "I don't finish when the PR is merged. I watch metrics, read logs and close the feedback loop in the next pass.",
    },
  ],
};

export default function PrinciplesSection() {
  const { lang } = useI18n();
  const items = PRINCIPLES[lang];
  return (
    <SectionFrame
      id="principles"
      kicker={lang === "en" ? "Engineering principles" : "Principios de ingeniería"}
      title={lang === "en" ? "Six things I won't negotiate." : "Seis cosas que no negocio."}
      subtitle={
        lang === "en"
          ? "Opinions I've formed through academic projects, lab work and personal repositories. Each one has cost me pain at least once — which is why they're principles now, not preferences."
          : "Opiniones formadas en proyectos académicos, laboratorio y repositorios personales. Cada una me ha costado dolor al menos una vez — por eso ahora son principios, no preferencias."
      }
      className="principles-section"
    >
      <div className="principles-grid">
        {items.map((p) => (
          <article key={p.n} className="principle-card">
            <span className="principle-n">{p.n}</span>
            <h3 className="principle-head">{p.head}</h3>
            <p className="principle-body">{p.body}</p>
          </article>
        ))}
      </div>
    </SectionFrame>
  );
}
