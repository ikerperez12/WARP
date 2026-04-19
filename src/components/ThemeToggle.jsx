import { useTheme } from "../theme/ThemeProvider.jsx";
import { useI18n } from "../i18n/I18nProvider.jsx";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      className={`theme-toggle ${isLight ? "is-light" : "is-dark"}`}
      aria-label={t.misc.themeAria}
      aria-pressed={isLight}
      onClick={toggle}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-orb" aria-hidden="true">
          <span className="theme-toggle-orb-glow" />
          <span className="theme-toggle-orb-core" />
          <span className="theme-toggle-orb-ring" />
        </span>
        <span className="theme-toggle-stars" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="theme-toggle-star" style={{ "--i": i }} />
          ))}
        </span>
        <span className="theme-toggle-sun-ray" aria-hidden="true" />
      </span>
    </button>
  );
}
