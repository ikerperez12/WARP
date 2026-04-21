import { useI18n } from "../i18n/I18nProvider.jsx";
import Magnetic from "../visuals/Magnetic.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import "./VisualsGatewaySection.css";

const COPY = {
  es: {
    kicker: "Subpagina dedicada",
    title: "Estudios visuales fuera de la home.",
    subtitle:
      "Liquid Metal y Frutiger Aero salen del flujo principal para que la home respire mejor sin perder esas dos piezas inmersivas. Ahora viven juntas en una ruta aparte con mas margen visual.",
    points: [
      "La home principal queda mas ligera y mas continua.",
      "Las dos piezas pesadas conservan presencia y calidad alta.",
      "El acceso sigue siendo directo desde portfolio, footer y menu movil.",
    ],
    primary: "Abrir /visuals",
    secondary: "Seguir a proyectos",
  },
  en: {
    kicker: "Dedicated subpage",
    title: "Visual studies moved out of the home.",
    subtitle:
      "Liquid Metal and Frutiger Aero are removed from the main flow so the home can breathe better without losing those immersive pieces. They now live together in a separate route with more visual headroom.",
    points: [
      "The main home stays lighter and more continuous.",
      "Both heavy pieces keep their presence and high visual quality.",
      "Access remains direct from the portfolio, footer and mobile menu.",
    ],
    primary: "Open /visuals",
    secondary: "Continue to projects",
  },
};

export default function VisualsGatewaySection() {
  const { lang } = useI18n();
  const c = COPY[lang];

  return (
    <SectionFrame
      id="visuals-bridge"
      kicker={c.kicker}
      title={c.title}
      subtitle={c.subtitle}
      className="visuals-gateway-section"
    >
      <div className="visuals-gateway-layout">
        <ul className="visuals-gateway-points">
          {c.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <div className="visuals-gateway-actions">
          <Magnetic strength={0.18}>
            <a href="/visuals/" className="visuals-gateway-link visuals-gateway-link-primary">
              {c.primary}
            </a>
          </Magnetic>
          <Magnetic strength={0.16}>
            <a href="#projects" className="visuals-gateway-link visuals-gateway-link-secondary">
              {c.secondary}
            </a>
          </Magnetic>
        </div>
      </div>
    </SectionFrame>
  );
}
