import { isReduced, supportsFinePointer } from '../utils/motion.js';

export function initUI() {
  initMobileMenu();
  initBackToTop();
  initTicker();
  initCustomCursor();
  initHeroAmbient();
  refreshSurfaceInteractions();
}

export function refreshSurfaceInteractions() {
  if (!supportsFinePointer || isReduced()) return;

  const surfaces = Array.from(document.querySelectorAll([
    '[data-depth-card]',
    '.project-card',
    '.contact-card',
    '.contact-form',
    '.project-filter',
    '.utility-link',
  ].join(',')));

  surfaces.forEach((surface) => {
    if (surface.dataset.surfaceBound === 'true') return;
    surface.dataset.surfaceBound = 'true';
    surface.style.setProperty('--pointer-x', '50%');
    surface.style.setProperty('--pointer-y', '50%');
    surface.style.setProperty('--float-x', '0px');
    surface.style.setProperty('--float-y', '0px');
    surface.style.setProperty('--tilt-x', '0deg');
    surface.style.setProperty('--tilt-y', '0deg');

    surface.addEventListener('pointermove', (event) => {
      const rect = surface.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rx = ((x / rect.width) - 0.5) * 10;
      const ry = ((y / rect.height) - 0.5) * 10;

      surface.style.setProperty('--pointer-x', `${x}px`);
      surface.style.setProperty('--pointer-y', `${y}px`);
      surface.style.setProperty('--float-x', `${rx * 0.45}px`);
      surface.style.setProperty('--float-y', `${ry * 0.45}px`);
      surface.style.setProperty('--tilt-x', `${rx * 0.22}deg`);
      surface.style.setProperty('--tilt-y', `${ry * -0.22}deg`);
    });

    surface.addEventListener('pointerleave', () => {
      surface.style.setProperty('--pointer-x', '50%');
      surface.style.setProperty('--pointer-y', '50%');
      surface.style.setProperty('--float-x', '0px');
      surface.style.setProperty('--float-y', '0px');
      surface.style.setProperty('--tilt-x', '0deg');
      surface.style.setProperty('--tilt-y', '0deg');
    });
  });
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

function initTicker() {
  const track = document.getElementById('tech-ticker-track');
  if (!track || track.dataset.enhanced === 'true') return;

  const items = Array.from(track.children);
  if (!items.length) return;

  items.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  track.dataset.enhanced = 'true';
}

function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const dot = document.querySelector('.custom-cursor-dot');
  if (!cursor || !dot) return;

  if (!supportsFinePointer || isReduced()) {
    document.body.classList.remove('cursor-enabled');
    return;
  }

  const interactiveSelector = 'a, button, input, textarea, select, [data-depth-card], .project-card, .project-filter';
  document.body.classList.add('cursor-enabled');

  const moveCursor = (event) => {
    const { clientX, clientY } = event;
    cursor.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
    dot.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
    document.body.classList.toggle('cursor-hover', Boolean(event.target.closest(interactiveSelector)));
  };

  window.addEventListener('pointermove', moveCursor, { passive: true });
  window.addEventListener('pointerdown', () => document.body.classList.add('cursor-pressed'));
  window.addEventListener('pointerup', () => document.body.classList.remove('cursor-pressed'));
  window.addEventListener('blur', () => document.body.classList.remove('cursor-hover', 'cursor-pressed'));
}

function initHeroAmbient() {
  const heroShell = document.querySelector('.hero-shell');
  if (!heroShell || !supportsFinePointer || isReduced()) return;

  heroShell.addEventListener('pointermove', (event) => {
    const rect = heroShell.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const px = ((event.clientX - rect.left) / rect.width) * 100;
    const py = ((event.clientY - rect.top) / rect.height) * 100;
    heroShell.style.setProperty('--hero-mouse-x', `${px.toFixed(2)}%`);
    heroShell.style.setProperty('--hero-mouse-y', `${py.toFixed(2)}%`);
  });

  heroShell.addEventListener('pointerleave', () => {
    heroShell.style.setProperty('--hero-mouse-x', '50%');
    heroShell.style.setProperty('--hero-mouse-y', '50%');
  });
}
