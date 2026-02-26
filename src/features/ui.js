import { prefs, togglePref } from './preferences.js';
import { isReduced, MOTION } from '../utils/motion.js';
import anime from 'animejs/lib/anime.es.js';

export function initUI() {
  initPreloader();
  initTicker();
  initMobileMenu();
  initBackToTop();
  initSettingsPanel();
  syncVisualLabels();

  window.addEventListener('warp:prefs-changed', syncVisualLabels);
}

function initPreloader() {
  const preloader = document.getElementById('preloader');
  const preloaderFill = document.getElementById('preloader-fill');
  if (preloader && preloaderFill) {
    requestAnimationFrame(() => {
      preloaderFill.style.width = '100%';
      window.setTimeout(() => preloader.classList.add('is-hidden'), 620);
    });
  }
}

function initTicker() {
  const ticker = document.getElementById('tech-ticker-track');
  if (ticker && ticker.dataset.cloned !== 'true') {
    ticker.append(...Array.from(ticker.children).map((node) => node.cloneNode(true)));
    ticker.dataset.cloned = 'true';
  }
}

function initMobileMenu() {
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = Array.from(document.querySelectorAll('.mobile-link'));

  if (navToggle && mobileMenu) {
    const setMenu = (open) => {
      navToggle.classList.toggle('active', open);
      mobileMenu.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.style.overflow = open ? 'hidden' : '';
    };

    navToggle.addEventListener('click', () => {
      const open = !mobileMenu.classList.contains('open');
      setMenu(open);
      if (open && !isReduced()) {
        anime({
          targets: '.mobile-link',
          translateX: [42, 0],
          opacity: [0, 1],
          delay: anime.stagger(70, { start: 160 }),
          easing: MOTION.easePrimary,
          duration: MOTION.durationBase
        });
      }
    });

    mobileLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileMenu.classList.contains('open')) setMenu(false);
    });
  }
}

function initBackToTop() {
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: isReduced() ? 'auto' : 'smooth' });
    });
  }
}

function initSettingsPanel() {
  const uiToggle = document.getElementById('ui-toggle');
  const uiPanel = document.getElementById('ui-panel');
  if (uiToggle && uiPanel) {
    const closePanel = () => {
      uiPanel.classList.remove('open');
      uiPanel.setAttribute('aria-hidden', 'true');
      uiToggle.setAttribute('aria-expanded', 'false');
    };
    uiToggle.addEventListener('click', () => {
      const open = uiPanel.classList.toggle('open');
      uiPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
      uiToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    uiPanel.querySelectorAll('.ui-option').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-action');
        if (action === 'toggle-grain') togglePref('grain');
        if (action === 'toggle-cursor') togglePref('cursor');
        if (action === 'toggle-motion') togglePref('motion');
      });
    });
    document.addEventListener('click', (event) => {
      if (!uiPanel.classList.contains('open')) return;
      if (uiPanel.contains(event.target) || uiToggle.contains(event.target)) return;
      closePanel();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePanel();
    });
  }
}

function syncVisualLabels() {
  const grain = document.getElementById('grain-state');
  const cursor = document.getElementById('cursor-state');
  const motion = document.getElementById('motion-state');
  if (grain) grain.textContent = prefs.grain === 'on' ? 'On' : 'Off';
  if (cursor) cursor.textContent = prefs.cursor === 'on' ? 'On' : 'Off';
  if (motion) motion.textContent = prefs.motion === 'full' ? 'Full' : 'Reduced';
}
