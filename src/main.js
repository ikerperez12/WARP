import { initPreferences } from './features/preferences.js';
import { initUI } from './features/ui.js';
import { initScroll } from './features/scroll.js';
import { initProjects } from './features/projects.js';
import { initStats } from './features/stats.js';
import { initContactForm } from './features/contact.js';
import { initSiteControls } from './features/site-controls.js';
import { initLiveRegion } from './utils/dom.js';

initPreferences();

document.addEventListener('DOMContentLoaded', () => {
  initLiveRegion();
  initSiteControls();
  initUI();
  initScroll();
  initProjects();
  initStats();
  initContactForm();
});
