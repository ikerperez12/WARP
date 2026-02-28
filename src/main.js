import { initPreferences } from './features/preferences.js';
import { initUI } from './features/ui.js';
import { initCursor } from './features/cursor.js';
import { initScroll } from './features/scroll.js';
import { initProjects } from './features/projects.js';
import { initSiteContent } from './features/site-content.js';
import { initSiteControls } from './features/site-controls.js';
import { initStats } from './features/stats.js';
import { initContactForm } from './features/contact.js';
import { initLiveRegion } from './utils/dom.js';

initPreferences();

document.addEventListener('DOMContentLoaded', async () => {
  initLiveRegion();
  initSiteContent();
  initSiteControls();
  initUI();
  initCursor();
  initScroll();
  initProjects();
  initStats();
  initContactForm();

  queueVisibilityInit('#hero', async () => {
    const { initThreeScene } = await import('./three-scene.js');
    return initThreeScene();
  }, { rootMargin: '20% 0px 20% 0px' });

  queueVisibilityInit('#showcase, #motion-reel, #neo-lab, #anime-lab', async () => {
    const { initImmersiveSections } = await import('./features/immersive.js');
    const { initAdvancedMotion } = await import('./features/advanced-motion.js');
    initImmersiveSections();
    initAdvancedMotion();
  }, { rootMargin: '22% 0px 22% 0px' });

  queueVisibilityInit('#google-services-section, #flow-simulator, #topology-lab, #split-reveal', async () => {
    const { initGoogleServicesSection } = await import('./features/google-services.js');
    const { initExperienceLab } = await import('./features/experience-lab.js');
    initGoogleServicesSection();
    initExperienceLab();
  }, { rootMargin: '18% 0px 18% 0px' });

  queueVisibilityInit('#elite-cases, #tech-playbook', async () => {
    const { initPortfolioPlus } = await import('./features/portfolio-plus.js');
    initPortfolioPlus();
  }, { rootMargin: '16% 0px 16% 0px' });
});

function queueVisibilityInit(selector, loader, options = {}) {
  const targets = selector
    .split(',')
    .map((entry) => document.querySelector(entry.trim()))
    .filter(Boolean);

  if (!targets.length) return;

  let started = false;
  let observer = null;
  const start = async () => {
    if (started) return;
    started = true;
    observer?.disconnect();
    await loader();
  };

  if (!('IntersectionObserver' in window)) {
    void start();
    return;
  }

  observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) void start();
  }, { threshold: 0.01, ...options });

  targets.forEach((target) => observer.observe(target));
}
