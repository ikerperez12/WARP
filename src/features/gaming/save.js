import { GAME_SAVE_KEY, GAME_SAVE_VERSION } from './config.js';

export function normalizeSave(raw = {}) {
  if (!raw || raw.version !== GAME_SAVE_VERSION) return null;

  return {
    version: GAME_SAVE_VERSION,
    completedMissions: Array.isArray(raw.completedMissions) ? [...raw.completedMissions] : [],
    unlockedSectors: Array.isArray(raw.unlockedSectors) ? [...raw.unlockedSectors] : ['boot-relay'],
    currentMission: typeof raw.currentMission === 'string' ? raw.currentMission : 'boot-sequence',
    bestScores: {
      security: Number(raw.bestScores?.security || 0),
      routing: Number(raw.bestScores?.routing || 0),
      inference: Number(raw.bestScores?.inference || 0),
    },
    settings: {
      quality: typeof raw.settings?.quality === 'string' ? raw.settings.quality : 'auto',
    },
  };
}

export function buildSavePayload(state) {
  return {
    version: GAME_SAVE_VERSION,
    completedMissions: [...state.completedMissions],
    unlockedSectors: [...state.unlockedSectors],
    currentMission: state.currentMission,
    bestScores: {
      security: Number(state.bestScores?.security || 0),
      routing: Number(state.bestScores?.routing || 0),
      inference: Number(state.bestScores?.inference || 0),
    },
    settings: {
      quality: state.settings?.quality || 'auto',
    },
  };
}

export function loadSave(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(GAME_SAVE_KEY);
    if (!raw) return null;
    return normalizeSave(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function persistSave(state, storage = globalThis.localStorage) {
  const payload = buildSavePayload(state);
  try {
    storage?.setItem(GAME_SAVE_KEY, JSON.stringify(payload));
  } catch {
    return null;
  }
  return payload;
}

export function resetSave(storage = globalThis.localStorage) {
  try {
    storage?.removeItem(GAME_SAVE_KEY);
  } catch {
    return false;
  }
  return true;
}
