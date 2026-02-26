import { initThreeScene } from './three-scene.js';
import { initPreferences } from './features/preferences.js';
import { initUI } from './features/ui.js';
import { initCursor } from './features/cursor.js';
import { initScroll } from './features/scroll.js';
import { initProjects } from './features/projects.js';
import { initStats } from './features/stats.js';
import { initContactForm } from './features/contact.js';
import { initLiveRegion } from './utils/dom.js';

// Initialize preferences early to apply critical styles (grain, etc.) before paint
initPreferences();

const disposeThreeScene = initThreeScene();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (typeof disposeThreeScene === 'function') disposeThreeScene();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLiveRegion();
  initUI();
  initCursor();
  initScroll();
  initProjects();
  initStats();
  initContactForm();
});
