import { MAX_ENERGY, MAX_INTEGRITY } from './config.js';

export const initialGameState = {
  started: false,
  paused: false,
  activeMode: 'vehicle',
  currentSector: 'boot-relay',
  currentMission: 'boot-sequence',
  completedMissions: [],
  unlockedSectors: ['boot-relay'],
  score: 0,
  integrity: MAX_INTEGRITY,
  energy: MAX_ENERGY,
  bestScores: {
    security: 0,
    routing: 0,
    inference: 0,
  },
  settings: {
    quality: 'auto',
    theme: 'dark',
    lang: 'es',
  },
};

export function createInitialState(overrides = {}) {
  return {
    ...initialGameState,
    ...overrides,
    completedMissions: [...(overrides.completedMissions || initialGameState.completedMissions)],
    unlockedSectors: [...(overrides.unlockedSectors || initialGameState.unlockedSectors)],
    bestScores: {
      ...initialGameState.bestScores,
      ...(overrides.bestScores || {}),
    },
    settings: {
      ...initialGameState.settings,
      ...(overrides.settings || {}),
    },
  };
}

export function clampPercent(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function hydrateGameState(saved = {}, prefs = {}) {
  return createInitialState({
    currentMission: saved.currentMission || initialGameState.currentMission,
    completedMissions: saved.completedMissions || [],
    unlockedSectors: saved.unlockedSectors?.length ? saved.unlockedSectors : ['boot-relay'],
    bestScores: {
      ...initialGameState.bestScores,
      ...(saved.bestScores || {}),
    },
    settings: {
      quality: saved.settings?.quality || 'auto',
      theme: prefs.theme || initialGameState.settings.theme,
      lang: prefs.lang || initialGameState.settings.lang,
    },
  });
}
