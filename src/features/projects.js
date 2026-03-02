import { toText, toId, toSafeGithubUrl } from '../utils/helpers.js';
import { isReduced, supportsFinePointer, MOTION } from '../utils/motion.js';
import { announce } from '../utils/dom.js';
import anime from 'animejs/lib/anime.es.js';

const FALLBACK_PROJECTS = [
  {
    id: 'warp-portfolio-3d',
    repoName: 'WARP',
    name: 'WARP Portfolio 3D',
    description: 'Portfolio inmersivo con render 3D, motion design y una presentación técnica más visual.',
    impact: 'Unifica identidad, narrativa y demostración técnica en una sola experiencia.',
    language: 'JavaScript',
    stack: ['Vite', 'Three.js', 'Anime.js', 'Vercel'],
    domain: 'web frontend ux production core',
    githubUrl: 'https://github.com/ikerperez12/WARP',
    demoUrl: 'https://portfolio-iker-perez.vercel.app/',
    imageUrl: 'https://opengraph.githubassets.com/1/ikerperez12/WARP',
    imageAlt: 'Vista previa del portfolio WARP',
    stars: 0,
    forks: 0,
    updatedAt: '2026-02-28T21:51:57Z',
    accent: 'accent-1',
  },
  {
    id: 'auditoria-pqc',
    repoName: '1.2-AuditoriaPQC',
    name: 'Auditoria PQC',
    description: 'Análisis aplicado de protocolos post-cuánticos y capturas de red en laboratorio.',
    impact: 'Refuerza criterio técnico en criptografía, auditoría y validación de seguridad.',
    language: 'Python',
    stack: ['Python', 'PQC', 'Wireshark', 'Auditing'],
    domain: 'security backend data production core',
    githubUrl: 'https://github.com/ikerperez12/1.2-AuditoriaPQC',
    demoUrl: '',
    imageUrl: 'https://opengraph.githubassets.com/1/ikerperez12/1.2-AuditoriaPQC',
    imageAlt: 'Vista previa del repositorio Auditoria PQC',
    stars: 2,
    forks: 0,
    updatedAt: '2026-02-28T21:45:42Z',
    accent: 'accent-3',
  },
];

let activeProjectFilter = 'all';
let activeServiceFilter = 'all';
let projectRegistry = FALLBACK_PROJECTS.slice();
const projectMap = new Map();
const PROJECT_COPY = {
  es: {
    allCategories: 'todas las categorías',
    showing: (shown, total, label) => `Mostrando ${shown} de ${total} proyectos (${label})`,
    updated: 'Actualizado',
    updatedToday: 'Actualizado hoy',
    agoDays: (days) => `Hace ${days} días`,
    topPick: 'Top pick',
    github: 'GitHub',
    impact: 'Impacto:',
    stackBase: 'stack base',
    stars: 'stars',
    forks: 'forks',
  },
  en: {
    allCategories: 'all categories',
    showing: (shown, total, label) => `Showing ${shown} of ${total} projects (${label})`,
    updated: 'Updated',
    updatedToday: 'Updated today',
    agoDays: (days) => `${days} days ago`,
    topPick: 'Top pick',
    github: 'GitHub',
    impact: 'Impact:',
    stackBase: 'core stack',
    stars: 'stars',
    forks: 'forks',
  },
};

export function initProjects() {
  initFilters();
  applyProjectFilter(activeProjectFilter);
  applyServiceFilter(activeServiceFilter);
  fetchProjects();
  window.addEventListener('warp:lang-changed', () => {
    renderProjectCards();
    initCardInteractions();
    applyProjectFilter(activeProjectFilter);
  });
}

function initFilters() {
  document.querySelectorAll('.project-filter').forEach((button) => {
    button.addEventListener('click', () => {
      applyProjectFilter(button.dataset.filter || 'all');
      announce(`Filtro de proyectos: ${button.dataset.filter || 'all'}`);
    });
  });

  document.querySelectorAll('.service-chip').forEach((button) => {
    button.addEventListener('click', () => {
      applyServiceFilter(button.dataset.serviceFilter || 'all');
      announce(`Categoría de servicio: ${button.dataset.serviceFilter || 'all'}`);
    });
  });
}

function initCardInteractions() {
  document.querySelectorAll('.projects-grid .project-card').forEach((card) => {
    if (supportsFinePointer) {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
      });
    }

    card.addEventListener('mouseenter', () => {
      if (isReduced()) return;
      anime({
        targets: card.querySelectorAll('.project-tags span, .project-metrics li'),
        translateY: [-4, 0],
        opacity: [0.68, 1],
        delay: anime.stagger(32),
        easing: MOTION.easeSoft,
        duration: MOTION.durationFast,
      });
    });
  });
}

function applyProjectFilter(filter) {
  const cards = Array.from(document.querySelectorAll('.projects-grid .project-card:not(.is-skeleton)'));
  activeProjectFilter = toText(filter, 'all').toLowerCase();
  let shown = 0;

  cards.forEach((card) => {
    const domains = toText(card.dataset.domain, '').toLowerCase().split(/\s+/).filter(Boolean);
    const visible = activeProjectFilter === 'all' || domains.includes(activeProjectFilter);
    card.classList.toggle('is-hidden', !visible);
    card.setAttribute('aria-hidden', visible ? 'false' : 'true');
    if (visible) shown += 1;
  });

  document.querySelectorAll('.project-filter').forEach((button) => {
    const value = toText(button.dataset.filter, 'all').toLowerCase();
    const active = value === activeProjectFilter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const status = document.getElementById('project-filter-status');
  if (status) {
    const copy = PROJECT_COPY[document.documentElement.lang === 'en' ? 'en' : 'es'];
    const label = activeProjectFilter === 'all' ? copy.allCategories : activeProjectFilter;
    status.textContent = copy.showing(shown, cards.length, label);
  }

  if (!isReduced()) {
    const visibleCards = cards.filter((card) => !card.classList.contains('is-hidden'));
    anime.remove(visibleCards);
    anime({
      targets: visibleCards,
      opacity: [0, 1],
      translateY: [12, 0],
      easing: MOTION.easePrimary,
      duration: MOTION.durationFast + 80,
      delay: anime.stagger(40),
    });
  }
}

function applyServiceFilter(filter) {
  const cards = Array.from(document.querySelectorAll('.services-grid .service-card'));
  activeServiceFilter = toText(filter, 'all').toLowerCase();
  cards.forEach((card) => {
    const domains = toText(card.dataset.serviceDomain, '').toLowerCase().split(/\s+/).filter(Boolean);
    const visible = activeServiceFilter === 'all' || domains.includes(activeServiceFilter);
    card.classList.toggle('is-hidden', !visible);
    card.setAttribute('aria-hidden', visible ? 'false' : 'true');
  });

  document.querySelectorAll('.service-chip').forEach((button) => {
    const value = toText(button.dataset.serviceFilter, 'all').toLowerCase();
    const active = value === activeServiceFilter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function normalizeProject(item, index) {
  const id = toId(item?.id || item?.repoName || item?.name || `project_${index + 1}`);
  const stack = Array.isArray(item?.stack)
    ? item.stack.map((entry) => toText(entry)).filter(Boolean).slice(0, 4)
    : [];

  return {
    id,
    repoName: toText(item?.repoName, item?.name || id),
    name: toText(item?.name, 'Proyecto'),
    description: toText(item?.description, 'Proyecto técnico con ejecución real y enfoque en producto.'),
    impact: toText(item?.impact, 'Aporta evidencia práctica del stack, criterio técnico y capacidad de entrega.'),
    language: toText(item?.language, 'Code'),
    stack: stack.length ? stack : [toText(item?.language, 'Code')],
    domain: toText(item?.domain, 'core production'),
    githubUrl: toSafeGithubUrl(item?.githubUrl),
    demoUrl: /^https:\/\//.test(toText(item?.demoUrl)) ? item.demoUrl : '',
    imageUrl: /^https:\/\//.test(toText(item?.imageUrl)) ? item.imageUrl : '',
    imageAlt: toText(item?.imageAlt, `Vista previa de ${toText(item?.name, 'proyecto')}`),
    stars: Number(item?.stars || 0),
    forks: Number(item?.forks || 0),
    updatedAt: toText(item?.updatedAt),
    accent: /accent-[1-4]/.test(toText(item?.accent)) ? item.accent : `accent-${(index % 4) + 1}`,
  };
}

function fetchProjects() {
  hydrateRegistry(FALLBACK_PROJECTS);

  fetch('/api/site-projects')
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
    .then((payload) => {
      const data = payload?.data;
      const normalized = Array.isArray(data)
        ? data.map((item, index) => normalizeProject(item, index)).filter((item) => item.id)
        : [];
      hydrateRegistry(normalized.length ? normalized : FALLBACK_PROJECTS);
    })
    .catch((error) => {
      console.warn('[projects] using fallback project registry', error);
      hydrateRegistry(FALLBACK_PROJECTS);
    });
}

function hydrateRegistry(items) {
  projectRegistry = items.slice();
  projectMap.clear();
  projectRegistry.forEach((item) => projectMap.set(item.id, item));
  renderProjectCards();
  initCardInteractions();
  applyProjectFilter(activeProjectFilter);
  window.dispatchEvent(new CustomEvent('warp:project-registry', { detail: { projects: projectRegistry } }));
}

function renderProjectCards() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = projectRegistry.map((project, index) => createProjectCardMarkup(project, index)).join('');
  bindCardMediaFallbacks(grid);
}

function createProjectCardMarkup(project, index) {
  const copy = PROJECT_COPY[document.documentElement.lang === 'en' ? 'en' : 'es'];
  const updatedLabel = formatRelativeDate(project.updatedAt);
  const metrics = [
    `<li><strong>${project.language}</strong><span>${copy.stackBase}</span></li>`,
    `<li><strong>${project.stars}</strong><span>${copy.stars}</span></li>`,
    `<li><strong>${project.forks}</strong><span>${copy.forks}</span></li>`,
  ].join('');

  const actions = [
    `<a href="${escapeHtml(project.githubUrl)}" rel="noopener noreferrer" class="project-link" aria-label="Abrir repositorio ${escapeHtml(project.name)} en GitHub">` +
      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>` +
    `</a>`,
  ];

  if (project.demoUrl) {
    actions.push(
      `<a href="${escapeHtml(project.demoUrl)}" rel="noopener noreferrer" class="project-link" aria-label="Abrir demo de ${escapeHtml(project.name)}">` +
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>` +
      `</a>`
    );
  }

  return `
    <article class="project-card anim-reveal" data-project-id="${escapeHtml(project.id)}" data-domain="${escapeHtml(project.domain)}">
      <div class="project-image">
        <img class="project-image-media" src="${escapeHtml(project.imageUrl)}" alt="${escapeHtml(project.imageAlt)}" loading="lazy" decoding="async" />
        <div class="project-image-placeholder ${escapeHtml(project.accent)}" aria-hidden="true">
          <span class="project-placeholder-label">${escapeHtml(project.repoName)}</span>
        </div>
        <div class="project-overlay">
          <div class="project-actions">${actions.join('')}</div>
        </div>
        <div class="project-badges">
          <span class="project-flag">${index < 3 ? copy.topPick : copy.github}</span>
          <span class="project-update">${escapeHtml(updatedLabel)}</span>
        </div>
      </div>
      <div class="project-info">
        <div class="project-tags">${project.stack.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
        <h3 class="project-title">${escapeHtml(project.name)}</h3>
        <p class="project-desc">${escapeHtml(project.description)}</p>
        <ul class="project-metrics">${metrics}</ul>
        <p class="project-impact"><strong>${copy.impact}</strong> ${escapeHtml(project.impact)}</p>
      </div>
    </article>
  `;
}

function bindCardMediaFallbacks(grid) {
  grid.querySelectorAll('.project-image-media').forEach((image) => {
    const showFallback = () => {
      image.classList.add('is-hidden');
      const placeholder = image.parentElement?.querySelector('.project-image-placeholder');
      if (placeholder) placeholder.classList.add('is-visible');
    };

    image.addEventListener('error', showFallback, { once: true });
    image.addEventListener('load', () => {
      const placeholder = image.parentElement?.querySelector('.project-image-placeholder');
      if (placeholder) placeholder.classList.remove('is-visible');
    }, { once: true });
  });
}

function formatRelativeDate(value) {
  const copy = PROJECT_COPY[document.documentElement.lang === 'en' ? 'en' : 'es'];
  if (!value) return copy.updated;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return copy.updated;
  const diffDays = Math.max(0, Math.round((Date.now() - date.getTime()) / 86400000));
  if (diffDays <= 1) return copy.updatedToday;
  if (diffDays < 30) return copy.agoDays(diffDays);
  const formatter = new Intl.DateTimeFormat(document.documentElement.lang === 'en' ? 'en-US' : 'es-ES', { month: 'short', year: 'numeric' });
  return formatter.format(date);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
