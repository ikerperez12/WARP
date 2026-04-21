import { useI18n } from "../i18n/I18nProvider.jsx";
import { CONTACT_INFO } from "../i18n/copy.js";
import "./FooterSection.css";

const ANCHORS = ["#about", "#stack", "#projects", "#experience", "#contact"];

export default function FooterSection() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <a href="#main" className="site-footer-logo">
            <span className="brand-bracket">{"<"}</span>
            <span className="brand-initials">IP</span>
            <span className="brand-bracket">{"/>"}</span>
          </a>
          <p className="site-footer-meta">{t.footer.meta}</p>
          <p className="site-footer-availability">
            <span className="site-footer-dot" aria-hidden="true" />
            {t.footer.availability}
          </p>
        </div>

        <nav className="site-footer-nav" aria-label="Footer">
          {t.footer.nav.map((label, i) => (
            <a key={label} href={ANCHORS[i]}>{label}</a>
          ))}
        </nav>

        <div className="site-footer-social">
          <a href="/visuals/">Visuals</a>
          <a href={`mailto:${CONTACT_INFO.email}`}>Email</a>
          <a href={CONTACT_INFO.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={CONTACT_INFO.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© {year} Iker Perez Garcia</span>
        <span>nexoip.click</span>
      </div>
    </footer>
  );
}
