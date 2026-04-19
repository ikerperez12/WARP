import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import "./ExperienceSection.css";

export default function ExperienceSection() {
  const { t } = useI18n();
  return (
    <SectionFrame
      id="experience"
      kicker={t.experience.kicker}
      title={t.sections.experienceTitle}
      subtitle={t.sections.experienceSubtitle}
      className="experience-section"
    >
      <div className="experience-intro">
        <ul className="experience-intro-list">
          {t.experience.list.map((item, i) => (
            <li key={i}>
              <span className="experience-intro-bullet" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="experience-metrics">
          {t.experience.metricTitles.map((m, i) => (
            <div key={m} className="experience-metric">
              <span className="experience-metric-label">{m}</span>
              <span className="experience-metric-value">{t.experience.metricValues[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <ol className="experience-timeline">
        <span className="experience-rail" aria-hidden="true" />
        {t.experience.timeline.map((item, i) => (
          <li key={i} className="experience-item">
            <span className="experience-item-dot" aria-hidden="true" />
            <time className="experience-item-date">{item.date}</time>
            <div className="experience-item-card">
              <h3>{item.title}</h3>
              <p className="experience-item-company">{item.company}</p>
              <p className="experience-item-body">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionFrame>
  );
}
