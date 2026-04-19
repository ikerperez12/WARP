import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { copy } from "./copy.js";

const STORAGE_KEY = "warp:lang";
const DEFAULT_LANG = "es";
const SUPPORTED = ["es", "en"];

const I18nContext = createContext(null);

function readInitialLang() {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch {}
  const browser = (window.navigator?.language || "").slice(0, 2).toLowerCase();
  return SUPPORTED.includes(browser) ? browser : DEFAULT_LANG;
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(readInitialLang);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
    document.documentElement.setAttribute("lang", lang);
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", copy[lang].meta.description);
    document.title = copy[lang].meta.title;
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((current) => (current === "es" ? "en" : "es"));
  }, []);

  const value = useMemo(
    () => ({
      lang,
      t: copy[lang],
      toggle,
      setLang,
    }),
    [lang, toggle]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
