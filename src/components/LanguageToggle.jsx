import { useI18n } from "../i18n/I18nProvider.jsx";
import "./LanguageToggle.css";

export default function LanguageToggle() {
  const { lang, toggle, t } = useI18n();
  return (
    <button
      type="button"
      className="lang-toggle"
      aria-label={t.misc.langAria}
      onClick={toggle}
    >
      <span className={`lang-toggle-pill ${lang === "es" ? "is-active" : ""}`}>ES</span>
      <span className="lang-toggle-divider" aria-hidden="true">/</span>
      <span className={`lang-toggle-pill ${lang === "en" ? "is-active" : ""}`}>EN</span>
    </button>
  );
}
