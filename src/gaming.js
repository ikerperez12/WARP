import { initPreferences, prefs, updatePref } from './features/preferences.js';
import { initLiveRegion } from './utils/dom.js';
import { GameApp } from './features/gaming/app.js';

initPreferences();

function getRefs() {
  return {
    root: document.getElementById('game-root'),
    canvas: document.getElementById('game-canvas'),
    overlays: {
      start: document.getElementById('game-start-overlay'),
      pause: document.getElementById('game-pause-overlay'),
      over: document.getElementById('game-over-overlay'),
      victory: document.getElementById('game-victory-overlay'),
      fallback: document.getElementById('game-fallback-overlay'),
    },
    buttons: {
      start: document.getElementById('btn-start-game'),
      pause: document.getElementById('btn-pause-game'),
      resume: document.getElementById('btn-resume-game'),
      restart: document.getElementById('btn-restart-game'),
      playAgain: document.getElementById('btn-play-again'),
      reset: document.getElementById('btn-reset-progress'),
      theme: document.getElementById('btn-theme-toggle'),
      lang: document.getElementById('btn-lang-toggle'),
    },
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  initLiveRegion();
  const refs = getRefs();
  const app = new GameApp({
    canvas: refs.canvas,
    root: refs.root,
    initialPrefs: prefs,
  });

  try {
    await app.init();
  } catch (error) {
    console.error('Unable to initialize Red Cyber Ops', error);
    app.showFallback();
    return;
  }

  refs.buttons.start?.addEventListener('click', () => app.start());
  refs.buttons.pause?.addEventListener('click', () => app.pause());
  refs.buttons.resume?.addEventListener('click', () => app.resume());
  refs.buttons.restart?.addEventListener('click', () => app.restartFromCheckpoint());
  refs.buttons.playAgain?.addEventListener('click', () => app.resetAndStart());
  refs.buttons.reset?.addEventListener('click', () => app.resetProgress());
  refs.buttons.theme?.addEventListener('click', () => updatePref('theme', prefs.theme === 'dark' ? 'light' : 'dark'));
  refs.buttons.lang?.addEventListener('click', () => updatePref('lang', prefs.lang === 'es' ? 'en' : 'es'));

  window.addEventListener('warp:prefs-changed', (event) => {
    app.syncPrefs(event.detail?.prefs || prefs);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && app.hasStarted() && app.isPaused()) {
      event.preventDefault();
      app.resume();
    }
  });
});
