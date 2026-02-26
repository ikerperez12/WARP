import { isReduced } from '../utils/motion.js';

export function initPortfolioPlus() {
  initEliteCases();
  initTechPlaybook();
}

function initEliteCases() {
  const root = document.getElementById('elite-cases');
  if (!root) return;

  const filters = Array.from(root.querySelectorAll('.elite-filter'));
  const cards = Array.from(root.querySelectorAll('.elite-card'));
  if (!filters.length || !cards.length) return;

  const animateCount = (node) => {
    const target = Number(node.dataset.countTarget || 0);
    if (!Number.isFinite(target)) return;
    if (isReduced()) {
      node.textContent = String(target);
      return;
    }

    const duration = 760;
    const start = performance.now();
    const from = 0;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (target - from) * eased);
      node.textContent = String(value);
      if (t < 1) window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  };

  const refreshCounters = (visibleCards) => {
    visibleCards.forEach((card) => {
      card.querySelectorAll('[data-count-target]').forEach((metric) => animateCount(metric));
    });
  };

  const applyFilter = (value) => {
    const filter = String(value || 'all').toLowerCase();
    const visibleCards = [];

    cards.forEach((card) => {
      const groups = String(card.dataset.elite || '').toLowerCase().split(/\s+/).filter(Boolean);
      const show = filter === 'all' || groups.includes(filter);
      card.classList.toggle('is-hidden', !show);
      card.setAttribute('aria-hidden', show ? 'false' : 'true');
      if (show) visibleCards.push(card);
    });

    filters.forEach((button) => {
      const active = String(button.dataset.eliteFilter || 'all').toLowerCase() === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    refreshCounters(visibleCards);
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      applyFilter(button.dataset.eliteFilter || 'all');
    });
  });

  applyFilter('all');
}

function initTechPlaybook() {
  const root = document.getElementById('tech-playbook');
  if (!root) return;

  const buttons = Array.from(root.querySelectorAll('.playbook-btn'));
  const title = document.getElementById('playbook-title');
  const description = document.getElementById('playbook-description');
  const tags = document.getElementById('playbook-tags');
  const steps = document.getElementById('playbook-steps');
  const kpiA = document.getElementById('playbook-kpi-a');
  const kpiB = document.getElementById('playbook-kpi-b');
  if (!buttons.length || !title || !description || !tags || !steps || !kpiA || !kpiB) return;

  const scenarios = {
    launch: {
      title: 'Lanzamiento MVP con stack cloud modular',
      description: 'Salida rápida con base sólida para evolucionar producto sin rehacer arquitectura en la siguiente fase.',
      tags: ['Vite', 'Node.js', 'Docker', 'Cloud Run', 'PostgreSQL'],
      steps: [
        'Definir alcance mínimo y métricas de éxito de lanzamiento.',
        'Construir API + frontend con contratos versionados.',
        'Configurar pipeline CI/CD y monitorización inicial.',
      ],
      kpiA: '14',
      kpiB: '99.9',
    },
    scale: {
      title: 'Escalado estable con observabilidad activa',
      description: 'Estrategia para crecer tráfico sin perder control de costes, latencia ni trazabilidad operativa.',
      tags: ['Nginx', 'Redis', 'BigQuery', 'Looker', 'SLOs'],
      steps: [
        'Instrumentar métricas de negocio y métricas técnicas por servicio.',
        'Introducir caché selectiva y políticas de autoscaling controlado.',
        'Crear paneles de alertas por umbral de latencia y error budget.',
      ],
      kpiA: '35',
      kpiB: '48',
    },
    secure: {
      title: 'Fortificación seguridad desde diseño',
      description: 'Hardening continuo para proteger superficie pública y acortar el tiempo de respuesta ante incidentes.',
      tags: ['CSP', 'Rate Limit', 'WAF', 'IAM', 'Audit Logs'],
      steps: [
        'Aplicar validación estricta de entradas y salida de errores segura.',
        'Definir controles por capa: app, red, identidad y despliegue.',
        'Automatizar revisiones de seguridad en cada release.',
      ],
      kpiA: '0',
      kpiB: '72',
    },
  };

  const render = (scenarioKey) => {
    const data = scenarios[scenarioKey] || scenarios.launch;
    title.textContent = data.title;
    description.textContent = data.description;
    tags.innerHTML = data.tags.map((item) => `<span>${item}</span>`).join('');
    steps.innerHTML = data.steps.map((item) => `<li>${item}</li>`).join('');
    kpiA.textContent = data.kpiA;
    kpiB.textContent = data.kpiB;

    buttons.forEach((button) => {
      const active = (button.dataset.playbook || 'launch') === scenarioKey;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      render(button.dataset.playbook || 'launch');
    });
  });
}
