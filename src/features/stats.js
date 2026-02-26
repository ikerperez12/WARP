import { isReduced, MOTION } from '../utils/motion.js';
import anime from 'animejs/lib/anime.es.js';

export function initStats() {
  initTypedText();
  initStatsCounter();
  initSkillBars();
}

function initTypedText() {
  const typed = document.getElementById('typed-text');
  if (typed) {
    const phrases = ['Applied cybersecurity', 'Backend architecture', 'Distributed systems', 'Cloud automation', 'AI and NLP', 'Performance optimization'];
    if (isReduced()) {
      typed.textContent = phrases[0];
    } else {
      let p = 0;
      let i = 0;
      let del = false;
      const tick = () => {
        const phrase = phrases[p];
        i += del ? -1 : 1;
        typed.textContent = phrase.slice(0, i);
        let delay = del ? 44 : 78;
        if (!del && i >= phrase.length) { del = true; delay = 1500; }
        else if (del && i <= 0) { del = false; p = (p + 1) % phrases.length; delay = 420; }
        window.setTimeout(tick, delay);
      };
      window.setTimeout(tick, 900);
    }
  }
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
      statNodes.forEach((node) => {
        const counter = { value: 0 };
        const target = parseInt(node.dataset.target || '0', 10) || 0;
        anime({
          targets: counter,
          value: target,
          round: 1,
          easing: MOTION.easePrimary,
          duration: MOTION.durationSlow,
          update: () => { node.textContent = String(counter.value); }
        });
      });
    }, 700);
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
        anime({
          targets: entry.target, width: `${width}%`, easing: MOTION.easePrimary, duration: MOTION.durationSlow, delay: 220,
          update: () => entry.target.setAttribute('aria-valuenow', width),
        });
        skillObserver.unobserve(entry.target);
      });
    }, { threshold: 0.42 });
    skillBars.forEach((bar) => skillObserver.observe(bar));
  }
}
