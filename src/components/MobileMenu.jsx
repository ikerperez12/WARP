import { useEffect } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import "./MobileMenu.css";

const ANCHORS = ["#about", "#stack", "#projects", "#experience", "#contact"];

export default function MobileMenu({ open, onClose }) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="mobile-menu-backdrop" onClick={onClose} />
      <div className="mobile-menu-panel" role="dialog" aria-modal="true">
        <button type="button" className="mobile-menu-close" onClick={onClose} aria-label="Cerrar menu">
          ×
        </button>
        <nav className="mobile-menu-nav" aria-label="Mobile">
          {t.nav.map((label, i) => (
            <a key={label} href={ANCHORS[i]} onClick={onClose} className="mobile-menu-link">
              <span className="mobile-menu-link-index">{String(i + 1).padStart(2, "0")}</span>
              <span className="mobile-menu-link-label">{label}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
