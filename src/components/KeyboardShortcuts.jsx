import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useTheme } from "../theme/ThemeProvider.jsx";
import "./KeyboardShortcuts.css";

const SHORTCUTS = [
  { keys: ["?"], labelEs: "Abrir/cerrar este panel", labelEn: "Open/close this panel" },
  { keys: ["T"], labelEs: "Alternar tema claro/oscuro", labelEn: "Toggle light/dark theme" },
  { keys: ["L"], labelEs: "Cambiar idioma ES/EN", labelEn: "Switch language ES/EN" },
  { keys: ["G", "H"], labelEs: "Ir al Hero", labelEn: "Go to Hero" },
  { keys: ["G", "P"], labelEs: "Ir a Proyectos", labelEn: "Go to Projects" },
  { keys: ["G", "C"], labelEs: "Ir a Contacto", labelEn: "Go to Contact" },
  { keys: ["Esc"], labelEs: "Cerrar panel", labelEn: "Close panel" },
];

export default function KeyboardShortcuts() {
  const { lang, toggle: toggleLang } = useI18n();
  const { toggle: toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let buffer = [];
    let bufferTimer;

    const isTyping = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
    };

    const onKey = (e) => {
      if (isTyping()) return;

      if (e.key === "Escape") {
        setOpen(false);
        buffer = [];
        return;
      }
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "t" || e.key === "T") {
        toggleTheme();
        return;
      }
      if (e.key === "l" || e.key === "L") {
        toggleLang();
        return;
      }
      if (e.key === "g" || e.key === "G") {
        buffer = ["g"];
        clearTimeout(bufferTimer);
        bufferTimer = setTimeout(() => (buffer = []), 900);
        return;
      }
      if (buffer[0] === "g") {
        const k = e.key.toLowerCase();
        const target =
          k === "h" ? "#hero" :
          k === "p" ? "#projects" :
          k === "c" ? "#contact" :
          k === "a" ? "#about" :
          k === "s" ? "#stack" :
          null;
        buffer = [];
        if (target) {
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(bufferTimer);
    };
  }, [toggleLang, toggleTheme]);

  if (!open) {
    return (
      <button
        type="button"
        className="ks-hint"
        aria-label={lang === "en" ? "Keyboard shortcuts" : "Atajos de teclado"}
        onClick={() => setOpen(true)}
      >
        <kbd>?</kbd>
      </button>
    );
  }

  return (
    <div className="ks-overlay" role="dialog" aria-modal="true">
      <div className="ks-backdrop" onClick={() => setOpen(false)} />
      <div className="ks-panel">
        <header className="ks-header">
          <p className="ks-kicker">{lang === "en" ? "Keyboard shortcuts" : "Atajos de teclado"}</p>
          <h3 className="ks-title">
            {lang === "en" ? "Navigate like an engineer." : "Navega como un ingeniero."}
          </h3>
          <button
            type="button"
            className="ks-close"
            onClick={() => setOpen(false)}
            aria-label={lang === "en" ? "Close" : "Cerrar"}
          >
            ×
          </button>
        </header>

        <ul className="ks-list">
          {SHORTCUTS.map((s, i) => (
            <li key={i} className="ks-row">
              <div className="ks-keys">
                {s.keys.map((k, j) => (
                  <kbd key={j}>{k}</kbd>
                ))}
              </div>
              <span className="ks-label">{lang === "en" ? s.labelEn : s.labelEs}</span>
            </li>
          ))}
        </ul>

        <footer className="ks-footer">
          <span>{lang === "en" ? "Press" : "Pulsa"}</span>
          <kbd>?</kbd>
          <span>{lang === "en" ? "anytime to toggle" : "en cualquier momento"}</span>
        </footer>
      </div>
    </div>
  );
}
