import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import "./AboutSection.css";

export default function AboutSection() {
  const { t } = useI18n();
  return (
    <SectionFrame
      id="about"
      kicker={t.sections.profileTitle}
      title={t.heroPanel.title}
      subtitle={t.sections.profileSubtitle}
      className="about-section"
    >
      <div className="about-grid">
        <article className="about-card about-card-hero">
          <div className="about-card-glow" aria-hidden="true" />
          <div className="about-card-content">
            <p className="about-kicker">{t.heroPanel.kicker}</p>
            {t.about.paragraphs.map((p, i) => (
              <p key={i} className="about-paragraph">{p}</p>
            ))}
          </div>
          <dl className="about-facts">
            {t.about.factsLabels.map((label, i) => (
              <div key={label} className="about-fact">
                <dt>{label}</dt>
                <dd>{t.about.factsValues[i]}</dd>
              </div>
            ))}
          </dl>
        </article>

        <div className="about-cards">
          {t.about.cardTitles.map((title, i) => (
            <article key={title} className="about-side-card">
              <span className="about-side-index">{String(i + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{t.about.cardTexts[i]}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="about-meta-bar">
        {t.heroPanel.metaLabels.map((label, i) => (
          <div key={label} className="about-meta">
            <span className="about-meta-label">{label}</span>
            <span className="about-meta-value">{t.heroPanel.metaValues[i]}</span>
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}
