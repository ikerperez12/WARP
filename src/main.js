import { initThreeScene } from './three-scene.js';
import { initPreferences } from './features/preferences.js';
import { initUI } from './features/ui.js';
import { initCursor } from './features/cursor.js';
import { initScroll } from './features/scroll.js';
import { initProjects } from './features/projects.js';
import { initSiteContent } from './features/site-content.js';
import { initStats } from './features/stats.js';
import { initContactForm } from './features/contact.js';
import { initImmersiveSections } from './features/immersive.js';
import { initAdvancedMotion } from './features/advanced-motion.js';
import { initGoogleServicesSection } from './features/google-services.js';
import { initExperienceLab } from './features/experience-lab.js';
import { initPortfolioPlus } from './features/portfolio-plus.js';
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
  initSiteContent();
  initUI();
  initCursor();
  initScroll();
  initProjects();
  initStats();
  initContactForm();
  initImmersiveSections();
  initAdvancedMotion();
  initGoogleServicesSection();
  initExperienceLab();
  initPortfolioPlus();
});
