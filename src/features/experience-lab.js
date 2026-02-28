import { clamp } from '../utils/math.js';
import { isReduced } from '../utils/motion.js';

export function initExperienceLab() {
  initFlowSimulator();
  initTopologyLab();
  initSplitReveal();
}

function initFlowSimulator() {
  const root = document.getElementById('flow-simulator');
  const range = document.getElementById('flow-progress');
  const playButton = document.getElementById('flow-play-btn');
  const meterBar = document.getElementById('flow-meter-bar');
  const status = document.getElementById('flow-status');
  const steps = Array.from(root?.querySelectorAll('.flow-step') || []);
  if (!root || !range || !playButton || !meterBar || !status || !steps.length) return;

  const stageLabels = steps.map((step, index) => {
    const label = step.dataset.flowLabel || step.querySelector('h3')?.textContent || `Stage ${index + 1}`;
    return String(label).trim();
  });

  let isPlaying = false;
  let rafId = 0;
  let startTime = 0;
  const durationMs = 5600;

  const render = (value) => {
    const progress = clamp(Number(value) || 0, 0, 100);
    const ratio = progress / 100;
    const currentIndex = Math.min(stageLabels.length - 1, Math.round(ratio * (stageLabels.length - 1)));
    const isEn = document.documentElement.lang === 'en';

    steps.forEach((step, index) => {
      step.classList.toggle('is-past', index < currentIndex);
      step.classList.toggle('is-current', index === currentIndex);
    });

    meterBar.style.width = `${progress.toFixed(2)}%`;
    status.textContent = isEn
      ? `Active stage: ${stageLabels[currentIndex]} ${Math.round(progress)}%`
      : `Etapa activa: ${stageLabels[currentIndex]} ${Math.round(progress)}%`;
  };

  const stop = () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
    isPlaying = false;
    startTime = 0;
    const isEn = document.documentElement.lang === 'en';
    playButton.textContent = Number(range.value) >= 99 ? (isEn ? 'Replay demo' : 'Repetir demo') : 'Auto demo';
  };

  const animate = (timestamp) => {
    if (!isPlaying) return;
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = clamp((elapsed / durationMs) * 100, 0, 100);
    range.value = progress.toFixed(2);
    render(progress);

    if (progress >= 100) {
      stop();
      return;
    }
    rafId = window.requestAnimationFrame(animate);
  };

  range.addEventListener('input', () => {
    if (isPlaying) stop();
    render(range.value);
  });

  playButton.addEventListener('click', () => {
    if (isPlaying) {
      stop();
      return;
    }

    if (isReduced()) {
      range.value = '100';
      render(100);
      playButton.textContent = document.documentElement.lang === 'en' ? 'Replay demo' : 'Repetir demo';
      return;
    }

    if (Number(range.value) >= 99) {
      range.value = '0';
      render(0);
    }

    isPlaying = true;
    playButton.textContent = document.documentElement.lang === 'en' ? 'Running...' : 'Ejecutando...';
    rafId = window.requestAnimationFrame(animate);
  });

  render(range.value);
  window.addEventListener('warp:lang-changed', () => render(range.value));
}

function initTopologyLab() {
  const root = document.getElementById('topology-lab');
  const stage = document.getElementById('topology-stage');
  const ring = document.getElementById('topology-ring');
  const status = document.getElementById('topology-status');
  const filters = Array.from(root?.querySelectorAll('.topology-filter') || []);
  const nodes = Array.from(root?.querySelectorAll('.topology-node') || []);
  if (!root || !stage || !ring || !status || !filters.length || !nodes.length) return;

  const descriptions = {
    es: {
      all: 'Cluster activo: sistema completo',
      cloud: 'Cluster activo: ejecución cloud',
      security: 'Cluster activo: capa de seguridad',
      ai: 'Cluster activo: inferencia IA',
      data: 'Cluster activo: capa de datos',
    },
    en: {
      all: 'Active cluster: full system',
      cloud: 'Active cluster: cloud delivery',
      security: 'Active cluster: security layer',
      ai: 'Active cluster: AI inference',
      data: 'Active cluster: data layer',
    },
  };

  const applyFilter = (type) => {
    const selected = String(type || 'all').toLowerCase();
    filters.forEach((button) => {
      const isActive = (button.dataset.topology || 'all') === selected;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    nodes.forEach((node) => {
      const cluster = String(node.dataset.cluster || '').toLowerCase();
      const visible = selected === 'all' || cluster === selected;
      node.classList.toggle('is-dim', !visible);
      node.classList.toggle('is-hot', selected !== 'all' && visible);
    });

    const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
    status.textContent = descriptions[lang][selected] || descriptions[lang].all;
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      applyFilter(button.dataset.topology || 'all');
    });
  });

  const resetTilt = () => {
    ring.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  stage.addEventListener('pointermove', (event) => {
    if (isReduced()) return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateX = clamp(py * -14, -14, 14);
    const rotateY = clamp(px * 16, -16, 16);
    ring.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  });

  stage.addEventListener('pointerleave', resetTilt);
  applyFilter('all');
  window.addEventListener('warp:lang-changed', () => applyFilter('all'));
}

function initSplitReveal() {
  const root = document.getElementById('split-reveal');
  const stage = document.getElementById('split-stage');
  const range = document.getElementById('split-range');
  const afterLayer = document.getElementById('split-after');
  const handle = document.getElementById('split-handle');
  const caption = document.getElementById('split-caption');
  if (!root || !stage || !range || !afterLayer || !handle || !caption) return;

  let dragging = false;

  const render = (value) => {
    const progress = clamp(Number(value) || 0, 0, 100);
    afterLayer.style.clipPath = `inset(0 ${(100 - progress).toFixed(2)}% 0 0)`;
    handle.style.left = `${progress.toFixed(2)}%`;

    const isEn = document.documentElement.lang === 'en';
    let state = isEn ? 'Balanced transition' : 'Transición balanceada';
    if (progress < 45) state = isEn ? 'Base state' : 'Estado base';
    else if (progress > 55) state = isEn ? 'Optimized version' : 'Versión optimizada';
    caption.textContent = isEn ? `${state} | ${Math.round(progress)}% optimized` : `${state} | ${Math.round(progress)}% optimizado`;
  };

  const setFromPointer = (event) => {
    const rect = stage.getBoundingClientRect();
    if (!rect.width) return;
    const progress = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    range.value = progress.toFixed(2);
    render(progress);
  };

  stage.addEventListener('pointerdown', (event) => {
    dragging = true;
    setFromPointer(event);
  });

  window.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    setFromPointer(event);
  });

  window.addEventListener('pointerup', () => {
    dragging = false;
  });

  range.addEventListener('input', () => render(range.value));

  if (isReduced()) {
    stage.classList.add('is-reduced');
  }

  render(range.value);
  window.addEventListener('warp:lang-changed', () => render(range.value));
}
