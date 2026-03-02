import { initPreferences } from './features/preferences.js';
import { initUI } from './features/ui.js';
import { initCursor } from './features/cursor.js';
import { initLiveRegion } from './utils/dom.js';
import { GameEngine } from './features/gaming/engine.js';

initPreferences();

document.addEventListener('DOMContentLoaded', async () => {
  initLiveRegion();
  initUI();
  initCursor();

  const canvas = document.getElementById('game-canvas');
  const startOverlay = document.getElementById('game-start-overlay');
  const gameOverOverlay = document.getElementById('game-over-overlay');
  const startBtn = document.getElementById('btn-start-game');
  const restartBtn = document.getElementById('btn-restart-game');
  const hud = document.getElementById('game-hud');

  // Initialize Game Engine
  const game = new GameEngine(canvas);
  await game.init();

  // Hide preloader when engine is ready
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    setTimeout(() => { preloader.style.display = 'none'; }, 500);
  }

  startBtn.addEventListener('click', () => {
    startOverlay.classList.add('is-hidden');
    hud.classList.add('is-active');
    game.start();
  });

  restartBtn.addEventListener('click', () => {
    gameOverOverlay.classList.add('is-hidden');
    game.reset();
    game.start();
  });

  // Handle game events
  window.addEventListener('game:over', (e) => {
    gameOverOverlay.classList.remove('is-hidden');
    document.getElementById('final-score').textContent = e.detail.score.toString().padStart(4, '0');
    hud.classList.remove('is-active');
  });

  window.addEventListener('game:update-hud', (e) => {
    document.getElementById('hud-score').textContent = e.detail.score.toString().padStart(4, '0');
    document.getElementById('hud-integrity').textContent = `${Math.ceil(e.detail.integrity)}%`;
    document.getElementById('hud-speed').textContent = e.detail.speed.toFixed(1);
  });
});
