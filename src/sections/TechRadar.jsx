import { useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import "./TechRadar.css";

/**
 * Technology Radar — ThoughtWorks-style visualization placing each technology
 * on a ring according to my current confidence level with it. The shorter the
 * distance from center, the deeper the experience.
 *
 *   ADOPT     — daily work, production-ready
 *   TRIAL     — hands-on projects, comfortable
 *   ASSESS    — studied, touched, learning
 *   HOLD      — tried but parked
 */

const RINGS = [
  { key: "adopt", label: "ADOPT", r: 60, color: "var(--accent-magenta)" },
  { key: "trial", label: "TRIAL", r: 120, color: "var(--accent-cyan)" },
  { key: "assess", label: "ASSESS", r: 180, color: "var(--accent-purple)" },
  { key: "hold", label: "HOLD", r: 240, color: "rgba(255,255,255,0.3)" },
];

// angle in deg, ring key, name
const BLIPS = [
  // ADOPT (daily, confident)
  { ring: "adopt", angle: 20, name: "Java" },
  { ring: "adopt", angle: 75, name: "Python" },
  { ring: "adopt", angle: 140, name: "Linux" },
  { ring: "adopt", angle: 210, name: "Git" },
  { ring: "adopt", angle: 280, name: "SQL" },
  { ring: "adopt", angle: 330, name: "Bash" },

  // TRIAL (comfortable, projects)
  { ring: "trial", angle: 15, name: "Docker" },
  { ring: "trial", angle: 55, name: "Spring" },
  { ring: "trial", angle: 95, name: "FastAPI" },
  { ring: "trial", angle: 135, name: "PostgreSQL" },
  { ring: "trial", angle: 175, name: "Wireshark" },
  { ring: "trial", angle: 215, name: "REST" },
  { ring: "trial", angle: 255, name: "C" },
  { ring: "trial", angle: 295, name: "GitHub Actions" },
  { ring: "trial", angle: 335, name: "TypeScript" },

  // ASSESS (learning, exploring)
  { ring: "assess", angle: 30, name: "React" },
  { ring: "assess", angle: 70, name: "Three.js" },
  { ring: "assess", angle: 110, name: "Rust" },
  { ring: "assess", angle: 150, name: "Kubernetes" },
  { ring: "assess", angle: 200, name: "PQC" },
  { ring: "assess", angle: 240, name: "AWS" },
  { ring: "assess", angle: 290, name: "LLM Ops" },
  { ring: "assess", angle: 325, name: "Cloudflare" },

  // HOLD (tried, not priority)
  { ring: "hold", angle: 60, name: "PHP" },
  { ring: "hold", angle: 160, name: "MATLAB" },
  { ring: "hold", angle: 260, name: "jQuery" },
];

function polar(angle, r) {
  const rad = (angle * Math.PI) / 180;
  return { x: 300 + r * Math.cos(rad), y: 300 + r * Math.sin(rad) };
}

export default function TechRadar() {
  const { lang } = useI18n();
  const [hover, setHover] = useState(null);

  return (
    <SectionFrame
      id="tech-radar"
      kicker={lang === "en" ? "Tech radar" : "Radar técnico"}
      title={lang === "en" ? "Where each technology sits today." : "Dónde está cada tecnología hoy."}
      subtitle={
        lang === "en"
          ? "ADOPT: daily production work. TRIAL: hands-on projects, comfortable. ASSESS: studied, learning. HOLD: tried and parked. Hover a blip to read its name."
          : "ADOPT: trabajo diario. TRIAL: proyectos prácticos, soltura. ASSESS: estudiado, aprendiendo. HOLD: probado y pausado. Pasa el ratón sobre cada punto para ver el nombre."
      }
      className="radar-section"
    >
      <div className="radar-wrapper">
        <svg viewBox="0 0 600 600" className="radar-svg" role="img">
          <defs>
            <radialGradient id="radar-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(168,85,247,0.18)" />
              <stop offset="100%" stopColor="rgba(2,2,5,0)" />
            </radialGradient>
          </defs>

          <circle cx="300" cy="300" r="260" fill="url(#radar-bg)" />

          {RINGS.map((ring) => (
            <g key={ring.key}>
              <circle
                cx="300"
                cy="300"
                r={ring.r}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.key === "adopt" ? 1.5 : 1}
                strokeOpacity={ring.key === "hold" ? 0.25 : 0.5}
                strokeDasharray={ring.key === "hold" ? "3 4" : "0"}
              />
              <text
                x="300"
                y={300 - ring.r - 6}
                textAnchor="middle"
                fill={ring.color}
                className="radar-ring-label"
              >
                {ring.label}
              </text>
            </g>
          ))}

          <line x1="40" y1="300" x2="560" y2="300" stroke="rgba(255,255,255,0.07)" />
          <line x1="300" y1="40" x2="300" y2="560" stroke="rgba(255,255,255,0.07)" />

          {BLIPS.map((b, i) => {
            const ring = RINGS.find((r) => r.key === b.ring);
            const { x, y } = polar(b.angle, ring.r);
            const isHover = hover === i;
            return (
              <g
                key={b.name}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                className="radar-blip"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHover ? 8 : 5}
                  fill={ring.color}
                  className="radar-blip-dot"
                />
                {isHover && (
                  <g>
                    <rect
                      x={x + 10}
                      y={y - 12}
                      width={b.name.length * 7.5 + 12}
                      height="22"
                      rx="4"
                      fill="rgba(2,2,5,0.92)"
                      stroke="rgba(255,0,119,0.5)"
                    />
                    <text
                      x={x + 16}
                      y={y + 3}
                      fill="#ffffff"
                      className="radar-blip-label"
                    >
                      {b.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          <circle cx="300" cy="300" r="3" fill="var(--accent-magenta)" />
        </svg>

        <div className="radar-legend">
          {RINGS.map((ring) => (
            <div key={ring.key} className="radar-legend-row">
              <span
                className="radar-legend-swatch"
                style={{ background: ring.color }}
              />
              <span className="radar-legend-label">{ring.label}</span>
              <span className="radar-legend-count">
                {BLIPS.filter((b) => b.ring === ring.key).length}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}
