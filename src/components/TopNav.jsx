import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import LanguageToggle from "./LanguageToggle.jsx";
import MobileMenu from "./MobileMenu.jsx";
import "./TopNav.css";

const ANCHORS = ["#about", "#stack", "#projects", "#experience", "#contact"];

export default function TopNav() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        {t.misc.skip}
      </a>
      <header className={`top-nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="top-nav-inner">
          <a href="#main" className="top-nav-brand" aria-label="Iker Perez Garcia">
            <span className="brand-bracket">{"<"}</span>
            <span className="brand-initials">IP</span>
            <span className="brand-bracket">{"/>"}</span>
          </a>

          <nav className="top-nav-links" aria-label="Primary">
            {t.nav.map((label, i) => (
              <a key={label} href={ANCHORS[i]} className="top-nav-link">
                {label}
              </a>
            ))}
          </nav>

          <div className="top-nav-actions">
            <LanguageToggle />
            <ThemeToggle />
            <button
              type="button"
              className="mobile-menu-trigger"
              aria-label={t.misc.menuAria}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
