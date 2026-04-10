import { prefs } from './preferences.js';
import { isReduced, supportsFinePointer } from '../utils/motion.js';
import { clamp } from '../utils/math.js';

export function initCursor() {
  setCursorEnabled();
  initCustomCursor();
  bindMagneticButtons();

  window.addEventListener('warp:prefs-changed', () => {
    setCursorEnabled();
    bindMagneticButtons();
  });
}

function setCursorEnabled() {
  const enabled = supportsFinePointer && prefs.cursor === 'on' && document.getElementById('custom-cursor') && document.getElementById('custom-cursor-dot');
  document.body.classList.toggle('cursor-enabled', Boolean(enabled));
  if (!enabled) document.body.classList.remove('cursor-hover');
}

function bindMagneticButtons() {
  const buttons = Array.from(document.querySelectorAll('.btn-magnetic'));
  if (isReduced() || !supportsFinePointer) {
    buttons.forEach((button) => {
      button.style.transform = 'none';
    });
    return;
  }
  buttons.forEach((button) => {
    if (button.dataset.magneticBound === 'true') return;
    button.dataset.magneticBound = 'true';
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const relX = event.clientX - rect.left - rect.width / 2;
      const relY = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate3d(${clamp(relX * 0.22, -10, 10)}px, ${clamp(relY * 0.2, -8, 8)}px, 0)`;
    });
    button.addEventListener('pointerleave', () => {
      button.style.transform = 'translate3d(0, 0, 0)';
    });
  });
}

function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');
  if (cursor && cursorDot) {
    window.addEventListener('pointermove', (event) => {
      if (!document.body.classList.contains('cursor-enabled')) return;
      const { clientX, clientY } = event;
      cursor.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      cursorDot.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
    }, { passive: true });

    document.addEventListener('pointerover', (event) => {
      if (!document.body.classList.contains('cursor-enabled')) return;
      const interactive = event.target.closest('a, button, .project-card, .timeline-item, .highlight, .skill-tag, input, textarea, select');
      document.body.classList.toggle('cursor-hover', Boolean(interactive));
    });
  }
}
