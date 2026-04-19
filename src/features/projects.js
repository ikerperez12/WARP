import { refreshSurfaceInteractions } from './ui.js';
import { toId, toSafeGithubUrl, toText } from '../utils/helpers.js';
import { prefs } from './preferences.js';

const TECH_ICON_MAP = {
  java: { label: 'Java', icon: '/media/icons/java.webp' },
  python: { label: 'Python', icon: '/media/icons/python.webp' },
  docker: { label: 'Docker', icon: '/media/icons/docker.webp' },
  react: { label: 'React', icon: '/media/icons/react.webp' },
  github: { label: 'GitHub', icon: '/media/icons/github.webp' },
  linux: { label: 'Linux', icon: '/media/icons/linux.webp' },
  windows: { label: 'Windows', icon: '/media/icons/windows.webp' },
  copilot: { label: 'Copilot', icon: '/media/icons/copilot.webp' },
  gemini: { label: 'Gemini', icon: '/media/icons/gemini.webp' },
};

const FILTER_KEYS = ['all', 'backend', 'security', 'automation', 'systems'];

const UI_COPY = {
  es: {
    filters: {
      all: 'todos',
      backend: 'backend',
      security: 'seguridad',
      automation: 'automatizacion',
      systems: 'sistemas',
    },
    count: (shown, total, label) => label === 'todos'
      ? `Mostrando ${shown} de ${total} proyectos`
      : `Mostrando ${shown} proyectos en ${label}`,
    empty: 'No hay proyectos en esta categoria todavia.',
    problem: 'Problema',
    outcome: 'Resultado',
    code: 'Ver codigo',
    demo: 'Ver demo',
    repo: 'Repositorio publico',
    featured: 'Seleccion principal',
  },
  en: {
    filters: {
      all: 'all',
      backend: 'backend',
      security: 'security',
      automation: 'automation',
      systems: 'systems',
    },
    count: (shown, total, label) => label === 'all'
      ? `Showing ${shown} of ${total} projects`
      : `Showing ${shown} projects in ${label}`,
    empty: 'There are no projects in this category yet.',
    problem: 'Problem',
    outcome: 'Outcome',
    code: 'View code',
    demo: 'View demo',
    repo: 'Public repository',
    featured: 'Primary selection',
  },
};

const FALLBACK_PROJECTS = [
  {
    id: 'isd',
    repoName: 'ISD',
    name: 'Internet y Sistemas Distribuidos',
    role: 'Backend y sistemas distribuidos',
    year: '2025',
    status: 'Academico',
    summary: 'Servicios desacoplados, APIs REST y despliegue reproducible con Docker y PostgreSQL.',
    problem: 'Disenar una base backend clara para comunicacion entre servicios, persistencia relacional y despliegue consistente.',
    outcome: 'Evidencia buen criterio en arquitectura backend, endpoints, contenedores y trabajo con bases de datos relacionales.',
    highlights: [
      'Diseno de endpoints y contratos para servicios distribuidos.',
      'Dockerizacion del entorno y persistencia sobre PostgreSQL.',
      'Trabajo orientado a integracion, arquitectura y mantenibilidad.',
    ],
    featuredTech: ['java', 'docker', 'github'],
    stack: ['Java', 'REST', 'Docker', 'PostgreSQL'],
    categories: ['backend', 'systems'],
    githubUrl: 'https://github.com/ikerperez12/ISD',
    demoUrl: '',
    featured: true,
  },
  {
    id: 'auditoria-pqc',
    repoName: '1.2-AuditoriaPQC',
    name: 'Auditoria PQC',
    role: 'Investigacion en seguridad',
    year: '2026',
    status: 'Investigacion',
    summary: 'Analisis tecnico de criptografia postcuantica, trafico de red y validacion de protocolos.',
    problem: 'Comprobar comportamiento real de protocolos y detectar puntos de riesgo desde capturas y revision tecnica.',
    outcome: 'Refuerza criterio en seguridad aplicada, lectura defensiva del sistema y documentacion de hallazgos.',
    highlights: [
      'Revision de protocolos postcuanticos con enfoque de validacion.',
      'Captura e interpretacion de trafico para verificar comportamiento real.',
      'Documentacion tecnica de hallazgos y superficie de riesgo.',
    ],
    featuredTech: ['python', 'linux', 'github'],
    stack: ['Python', 'PQC', 'Wireshark', 'Auditoria'],
    categories: ['security', 'systems'],
    githubUrl: 'https://github.com/ikerperez12/1.2-AuditoriaPQC',
    demoUrl: '',
    featured: true,
  },
  {
    id: 'gpt-cmd',
    repoName: 'GPT_CMD',
    name: 'GPT CMD',
    role: 'CLI y automatizacion',
    year: '2026',
    status: 'Automatizacion',
    summary: 'CLI para automatizar tareas tecnicas repetitivas con apoyo de IA y trabajo desde terminal.',
    problem: 'Reducir friccion en operaciones repetidas y flujos de terminal manteniendo control tecnico.',
    outcome: 'Demuestra iniciativa en tooling interno, automatizacion local y utilidades orientadas a productividad.',
    highlights: [
      'Automatizacion de prompts, comandos y pasos repetidos.',
      'Interfaz CLI pensada para uso diario y ciclos rapidos de prueba.',
      'Base util para evolucionar utilidades y tooling interno.',
    ],
    featuredTech: ['python', 'copilot', 'github'],
    stack: ['Python', 'CLI', 'Automatizacion', 'LLM Ops'],
    categories: ['automation', 'backend'],
    githubUrl: 'https://github.com/ikerperez12/GPT_CMD',
    demoUrl: '',
    featured: true,
  },
  {
    id: 'so-shell',
    repoName: 'SO-SHELL-p2',
    name: 'Shell y Sistemas Operativos',
    role: 'Programacion de sistemas',
    year: '2024',
    status: 'Sistemas',
    summary: 'Procesos, shell y fundamentos de sistemas con mentalidad de entorno operativo real.',
    problem: 'Trabajar cerca del sistema operativo para entender procesos, recursos y ejecucion en entorno POSIX.',
    outcome: 'Refuerza base de bajo nivel, diagnostico y razonamiento sobre comportamiento del sistema.',
    highlights: [
      'Control de procesos y ejecucion sobre entorno POSIX.',
      'Practicas de shell y automatizacion a bajo nivel.',
      'Diagnostico de comportamiento y recursos del sistema.',
    ],
    featuredTech: ['linux', 'github'],
    stack: ['C', 'POSIX', 'Shell', 'Procesos'],
    categories: ['systems'],
    githubUrl: 'https://github.com/ikerperez12/SO-SHELL-p2',
    demoUrl: '',
    featured: true,
  },
];

let projectRegistry = FALLBACK_PROJECTS.map((item, index) => normalizeProject(item, index));
let activeFilter = 'all';

export function initProjects() {
  bindProjectFilters();
  renderProjectCards();
  emitProjectRegistry();
  fetchProjects();
  window.addEventListener('warp:prefs-changed', renderProjectCards);
}

function bindProjectFilters() {
  const buttons = Array.from(document.querySelectorAll('.project-filter'));
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextFilter = button.dataset.filter || 'all';
      if (nextFilter === activeFilter) return;
      activeFilter = nextFilter;
      syncProjectFilters(buttons);
      renderProjectCards();
    });
  });

  syncProjectFilters(buttons);
}

function syncProjectFilters(buttons = Array.from(document.querySelectorAll('.project-filter'))) {
  buttons.forEach((button) => {
    const active = (button.dataset.filter || 'all') === activeFilter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function fetchProjects() {
  fetch('/projects.json')
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
    .then((data) => {
      if (!Array.isArray(data)) return;
      const normalized = data.map((item, index) => normalizeProject(item, index)).filter(Boolean);
      if (!normalized.length) return;
      projectRegistry = normalized;
      renderProjectCards();
      emitProjectRegistry();
    })
    .catch(() => {
      renderProjectCards();
      emitProjectRegistry();
    });
}

function normalizeProject(item, index) {
  const id = toId(item?.id || item?.repoName || item?.name || `project_${index + 1}`);
  if (!id) return null;

  const tech = Array.isArray(item?.featuredTech)
    ? item.featuredTech
        .map((entry) => toText(entry).toLowerCase())
        .filter((entry) => TECH_ICON_MAP[entry])
        .slice(0, 4)
    : [];

  const stack = Array.isArray(item?.stack)
    ? item.stack.map((entry) => toText(entry)).filter(Boolean).slice(0, 6)
    : [];

  const role = toText(item?.role, 'Proyecto tecnico');
  const status = toText(item?.status, 'Proyecto');
  const summary = toText(item?.summary || item?.focus || item?.description, 'Proyecto tecnico orientado a software mantenible y capacidad de entrega.');
  const problem = toText(item?.problem, 'Resolver una necesidad tecnica real con criterio de implementacion y mantenibilidad.');
  const outcome = toText(item?.outcome || item?.impact, 'Demuestra base tecnica, autonomia y capacidad para construir soluciones solidas.');

  return {
    id,
    repoName: toText(item?.repoName, toText(item?.name, 'Repo')),
    name: toText(item?.name, 'Proyecto'),
    role,
    year: /^\d{4}$/.test(toText(item?.year)) ? toText(item?.year) : String(new Date().getFullYear()),
    status,
    summary,
    problem,
    outcome,
    highlights: Array.isArray(item?.highlights)
      ? item.highlights.map((entry) => toText(entry)).filter(Boolean).slice(0, 3)
      : [],
    featuredTech: tech,
    stack,
    categories: deriveCategories(item, { role, status, summary, problem, outcome, stack }),
    githubUrl: toSafeGithubUrl(item?.githubUrl),
    demoUrl: /^https:\/\//.test(toText(item?.demoUrl)) ? item.demoUrl : '',
    featured: item?.featured !== false,
  };
}

function deriveCategories(item, normalized) {
  const explicit = Array.isArray(item?.categories)
    ? item.categories.map((entry) => toText(entry).toLowerCase()).filter(Boolean)
    : [];

  const categories = new Set(explicit);
  const haystack = [
    normalized.role,
    normalized.status,
    normalized.summary,
    normalized.problem,
    normalized.outcome,
    ...normalized.stack,
  ].join(' ').toLowerCase();

  if (/backend|rest|api|postgres|sql|spring|servicio/.test(haystack)) categories.add('backend');
  if (/seguridad|security|pqc|wireshark|auditoria|crypto|criptografia/.test(haystack)) categories.add('security');
  if (/automatizacion|automation|cli|tooling|llm|agente/.test(haystack)) categories.add('automation');
  if (/sistema|systems|linux|docker|shell|posix|infraestructura|procesos/.test(haystack)) categories.add('systems');
  if (!categories.size) categories.add('backend');

  return Array.from(categories).filter((entry) => FILTER_KEYS.includes(entry)).slice(0, 3);
}

function renderProjectCards() {
  const grid = document.getElementById('projects-grid');
  const status = document.getElementById('project-filter-status');
  if (!grid) return;

  const items = getVisibleProjects();
  const langCopy = getProjectCopy();
  if (!items.length) {
    grid.innerHTML = `<div class="project-empty">${langCopy.empty}</div>`;
  } else {
    grid.innerHTML = items.map((project, index) => createProjectCard(project, index)).join('');
    requestAnimationFrame(() => {
      Array.from(grid.querySelectorAll('.project-card')).forEach((card, index) => {
        card.style.setProperty('--enter-delay', `${index * 60}ms`);
        requestAnimationFrame(() => card.classList.add('is-visible'));
      });
    });
  }

  const filterLabel = langCopy.filters[activeFilter] || langCopy.filters.all;
  if (status) status.textContent = langCopy.count(items.length, projectRegistry.length, filterLabel);
  refreshSurfaceInteractions();
}

function getVisibleProjects() {
  const ordered = [...projectRegistry].sort((a, b) => {
    if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
    return Number(b.year) - Number(a.year);
  });

  if (activeFilter === 'all') return ordered;
  return ordered.filter((project) => project.categories.includes(activeFilter));
}

function createProjectCard(project, index) {
  const langCopy = getProjectCopy();
  const links = [];
  if (project.githubUrl) {
    links.push(`<a href="${escapeHtml(project.githubUrl)}" rel="noopener noreferrer" class="project-link">${langCopy.code}</a>`);
  }
  if (project.demoUrl) {
    links.push(`<a href="${escapeHtml(project.demoUrl)}" rel="noopener noreferrer" class="project-link">${langCopy.demo}</a>`);
  }

  const tone = project.categories[0] || 'backend';
  const isPrimary = activeFilter === 'all' && index === 0;
  const categoryChips = project.categories.length
    ? `<div class="project-categories">${project.categories.map((item) => `<span>${escapeHtml(langCopy.filters[item] || item)}</span>`).join('')}</div>`
    : '';
  const stackPreview = project.stack.slice(0, 3);
  const signalWidths = deriveSignalWidths(project);
  const visualIcons = project.featuredTech.length
    ? project.featuredTech.map(createTechOrb).join('')
    : '';

  return `
    <article class="project-card ${isPrimary ? 'project-card--featured' : ''}" data-project-id="${escapeHtml(project.id)}" data-tone="${escapeHtml(tone)}">
      <div class="project-card-shell">
        <div class="project-info">
          <div class="project-card-top">
            <span class="project-status">${escapeHtml(project.status)}</span>
            <span class="project-year">${escapeHtml(project.year)}</span>
          </div>
          <div class="project-card-heading">
            <div>
              ${isPrimary ? `<span class="project-accent-label">${escapeHtml(langCopy.featured)}</span>` : ''}
              <span class="project-role">${escapeHtml(project.role)}</span>
              <h3 class="project-title">${escapeHtml(project.name)}</h3>
            </div>
            <span class="project-repo">${escapeHtml(project.repoName)}</span>
          </div>
          <p class="project-summary">${escapeHtml(project.summary)}</p>
          ${categoryChips}
          <div class="project-detail-grid">
            <div class="project-detail">
              <span>${langCopy.problem}</span>
              <p>${escapeHtml(project.problem)}</p>
            </div>
            <div class="project-detail">
              <span>${langCopy.outcome}</span>
              <p>${escapeHtml(project.outcome)}</p>
            </div>
          </div>
          ${project.highlights.length ? `<ul class="project-highlight-list">${project.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
          ${project.featuredTech.length ? `<div class="project-tech-row">${project.featuredTech.map(createTechChip).join('')}</div>` : ''}
          ${project.stack.length ? `<div class="project-tags">${project.stack.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>` : ''}
          <div class="project-footer">
            <span class="project-role">${langCopy.repo}</span>
            <div class="project-footer-links">${links.join('')}</div>
          </div>
        </div>
        <div class="project-visual" aria-hidden="true">
          <div class="project-visual-glass">
            <div class="project-visual-head">
              <span class="project-visual-path">/${escapeHtml(project.repoName.toLowerCase())}</span>
              <span class="project-visual-badge">${escapeHtml(project.year)}</span>
            </div>
            <div class="project-visual-stage">
              <div class="project-visual-orbs">${visualIcons}</div>
              <div class="project-visual-panels">
                ${signalWidths.map((width, signalIndex) => `<span class="project-signal project-signal-${signalIndex + 1}" style="--signal-width:${width}%"></span>`).join('')}
              </div>
            </div>
            <div class="project-visual-foot">
              ${stackPreview.map((item) => `<span class="project-visual-pill">${escapeHtml(item)}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

function createTechChip(key) {
  const tech = TECH_ICON_MAP[key];
  if (!tech) return '';

  return `
    <span class="project-tech-chip">
      <span class="project-tech-icon"><img src="${escapeHtml(tech.icon)}" alt="" aria-hidden="true" loading="lazy" decoding="async" /></span>
      <span>${escapeHtml(tech.label)}</span>
    </span>
  `;
}

function createTechOrb(key) {
  const tech = TECH_ICON_MAP[key];
  if (!tech) return '';

  return `
    <span class="project-tech-orb">
      <img src="${escapeHtml(tech.icon)}" alt="" aria-hidden="true" loading="lazy" decoding="async" />
    </span>
  `;
}

function deriveSignalWidths(project) {
  const seed = `${project.id}${project.year}${project.stack.join('')}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  }

  return [0, 1, 2].map((offset) => 36 + ((hash + offset * 73) % 48));
}

function emitProjectRegistry() {
  window.dispatchEvent(new CustomEvent('warp:project-registry', { detail: { projects: projectRegistry } }));
}

function getProjectCopy() {
  return UI_COPY[prefs.lang] || UI_COPY.es;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
