import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import "./StackSection.css";

const ACCENTS = [
  { from: "var(--accent-cyan)", to: "var(--accent-purple)" },
  { from: "var(--accent-magenta)", to: "var(--accent-purple)" },
  { from: "var(--accent-cyan)", to: "var(--accent-magenta)" },
  { from: "var(--accent-purple)", to: "var(--accent-neon)" },
  { from: "var(--accent-magenta)", to: "var(--accent-cyan)" },
];

export default function StackSection() {
  const { t } = useI18n();
  return (
    <SectionFrame
      id="stack"
      kicker={t.sections.stackTitle}
      title={t.sections.stackTitle}
      subtitle={t.sections.stackSubtitle}
      className="stack-section"
    >
      <div className="stack-bento">
        {t.skills.titles.map((title, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <article
              key={title}
              className={`stack-cell stack-cell-${i}`}
              style={{ "--from": accent.from, "--to": accent.to }}
            >
              <div className="stack-cell-gradient" aria-hidden="true" />
              <div className="stack-cell-header">
                <span className="stack-cell-index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
              </div>
              <ul className="stack-cell-chips">
                {t.skills.groups[i]?.map((item) => (
                  <li key={item} className="stack-chip">
                    <span className="stack-chip-dot" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </SectionFrame>
  );
}
