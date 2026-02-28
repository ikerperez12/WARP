import { clamp } from '../utils/math.js';
import { isReduced } from '../utils/motion.js';

export function initAdvancedMotion() {
  initPadGrid();
  initTiltCards();
}

function initPadGrid() {
  const padButtons = Array.from(document.querySelectorAll('.pad-grid .pad-btn'));
  const padStatus = document.getElementById('pad-status');
  if (!padButtons.length || !padStatus) return;

  const updateStatus = (label) => {
    const isEn = document.documentElement.lang === 'en';
    padStatus.textContent = isEn ? `Active priority: ${label}` : `Prioridad activa: ${label}`;
  };

  padButtons.forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'pad-ripple';
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      button.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 520);

      const label = button.dataset.pad || button.textContent || 'Pad';
      updateStatus(label);
    });
  });

  window.addEventListener('warp:lang-changed', () => updateStatus(padButtons[0]?.dataset.pad || 'Latency'));
}

function initTiltCards() {
  const cards = Array.from(document.querySelectorAll('.tilt-card'));
  if (!cards.length) return;

  cards.forEach((card) => {
    const reset = () => {
      card.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
      card.style.setProperty('--tilt-glow-x', '50%');
      card.style.setProperty('--tilt-glow-y', '50%');
    };

    card.addEventListener('pointermove', (event) => {
      if (isReduced()) return;
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      const rotateY = clamp(px * 8, -8, 8);
      const rotateX = clamp(py * -8, -8, 8);
      card.style.transform = `translate3d(0, -4px, 0) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      card.style.setProperty('--tilt-glow-x', `${((px + 1) / 2) * 100}%`);
      card.style.setProperty('--tilt-glow-y', `${((py + 1) / 2) * 100}%`);
    });

    card.addEventListener('pointerleave', reset);
    card.addEventListener('blur', reset);
    reset();
  });
}
