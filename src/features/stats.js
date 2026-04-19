import { isReduced } from '../utils/motion.js';

export function initStats() {
  initStatsCounter();
  initSkillBars();
}

function initStatsCounter() {
  const statNodes = Array.from(document.querySelectorAll('.stat-number'));
  if (isReduced()) {
    statNodes.forEach((node) => {
      const target = parseInt(node.dataset.target || '0', 10);
      node.textContent = Number.isFinite(target) ? String(target) : '0';
    });
  } else {
    window.setTimeout(() => {
      statNodes.forEach((node) => animateCounter(node));
    }, 300);
  }
}

function initSkillBars() {
  const skillBars = Array.from(document.querySelectorAll('.skill-bar-fill'));
  if (isReduced()) {
    skillBars.forEach((bar) => {
      const width = bar.dataset.width || '0';
      bar.style.width = `${width}%`;
      bar.setAttribute('aria-valuenow', width);
    });
  } else {
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const width = entry.target.dataset.width || '0';
        window.requestAnimationFrame(() => {
          entry.target.style.width = `${width}%`;
          entry.target.setAttribute('aria-valuenow', width);
        });
        skillObserver.unobserve(entry.target);
      });
    }, { threshold: 0.42 });
    skillBars.forEach((bar) => skillObserver.observe(bar));
  }
}

function animateCounter(node) {
  const target = parseInt(node.dataset.target || '0', 10) || 0;
  const duration = 900;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = String(Math.round(target * eased));
    if (progress < 1) window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);
}
