const PREFS_KEY = "warp.visualPrefs";

function readStoredPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStoredPrefs(next) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    // ignore storage failures
  }
}

export function initPrefs(defaults = {}) {
  const stored = readStoredPrefs();
  const prefs = {
    theme: stored.theme === "light" ? "light" : defaults.theme || "dark",
    lang: stored.lang === "en" ? "en" : defaults.lang || "es",
  };
  applyPrefs(prefs);
  return prefs;
}

export function updatePrefs(partial) {
  const current = readStoredPrefs();
  const next = { ...current, ...partial };
  writeStoredPrefs(next);
  applyPrefs(next);
  window.dispatchEvent(new CustomEvent("warp:anime-prefs-changed", { detail: next }));
  return next;
}

export function applyPrefs(prefs) {
  const theme = prefs.theme === "light" ? "light" : "dark";
  const lang = prefs.lang === "en" ? "en" : "es";
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.lang = lang;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute("content", theme === "light" ? "#f3f7fb" : "#020202");
}
