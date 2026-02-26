const VISUAL_PREFS_KEY = 'warp.visualPrefs';
const DEFAULT_PREFS = { grain: 'on', cursor: 'on', motion: 'full' };

export const prefs = { ...DEFAULT_PREFS };

function readVisualPrefs() {
  try {
    const raw = localStorage.getItem(VISUAL_PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return {
      grain: parsed.grain === 'off' ? 'off' : 'on',
      cursor: parsed.cursor === 'off' ? 'off' : 'on',
      motion: parsed.motion === 'reduced' ? 'reduced' : 'full',
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function saveVisualPrefs() {
  try {
    localStorage.setItem(VISUAL_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors.
  }
}

function applyVisualPrefs() {
  document.body.dataset.grain = prefs.grain;
  document.body.dataset.cursor = prefs.cursor;
  document.body.dataset.motion = prefs.motion;
}

export function initPreferences() {
  const loaded = readVisualPrefs();
  Object.assign(prefs, loaded);
  applyVisualPrefs();
}

export function updatePref(key, value) {
  if (key in prefs) {
    prefs[key] = value;
    applyVisualPrefs();
    saveVisualPrefs();
    window.dispatchEvent(new CustomEvent('warp:prefs-changed', { detail: { prefs } }));
    if (key === 'motion') {
      window.dispatchEvent(new CustomEvent('warp:motion-mode', { detail: { mode: prefs.motion } }));
    }
  }
}

export function togglePref(key) {
  if (key === 'grain') updatePref('grain', prefs.grain === 'on' ? 'off' : 'on');
  else if (key === 'cursor') updatePref('cursor', prefs.cursor === 'on' ? 'off' : 'on');
  else if (key === 'motion') updatePref('motion', prefs.motion === 'full' ? 'reduced' : 'full');
}
