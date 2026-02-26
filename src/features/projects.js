import { toText, toId, toSafeGithubUrl } from '../utils/helpers.js';
import { isReduced, supportsFinePointer, MOTION } from '../utils/motion.js';
import { announce } from '../utils/dom.js';
import anime from 'animejs/lib/anime.es.js';

const FALLBACK_PROJECTS = [
  { id: 'fullstack-product-engineering', domain: 'web frontend ux core production', githubUrl: 'https://github.com/ikerperez12' },
  { id: 'ia-ml-nlp-lab', domain: 'ai data exploratory', githubUrl: 'https://github.com/ikerperez12' },
  { id: 'cybersecurity-lab', domain: 'security backend core production', githubUrl: 'https://github.com/ikerperez12' },
  { id: 'cloud-cicd-automation', domain: 'cloud backend production', githubUrl: 'https://github.com/ikerperez12' },
  { id: 'data-architecture-sql', domain: 'backend data core exploratory', githubUrl: 'https://github.com/ikerperez12' },
  { id: 'systems-hardware-infra', domain: 'backend systems production core', githubUrl: 'https://github.com/ikerperez12' },
];

let activeProjectFilter = 'all';
let activeServiceFilter = 'all';
let projectRegistry = FALLBACK_PROJECTS.slice();
const projectMap = new Map();

export function initProjects() {
  initFilters();
  initCardInteractions();

  // Apply initial filters
  applyProjectFilter(activeProjectFilter);
  applyServiceFilter(activeServiceFilter);

  // Fetch data
  fetchProjects();
}

function initFilters() {
  document.querySelectorAll('.project-filter').forEach((button) => {
    button.addEventListener('click', () => {
      applyProjectFilter(button.dataset.filter || 'all');
      announce(`Project filter set to ${button.dataset.filter || 'all'}`);
    });
  });
  document.querySelectorAll('.service-chip').forEach((button) => {
    button.addEventListener('click', () => {
      applyServiceFilter(button.dataset.serviceFilter || 'all');
      announce(`Service category set to ${button.dataset.serviceFilter || 'all'}`);
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
        targets: card.querySelectorAll('.project-tags span'),
        translateY: [-4, 0],
        opacity: [0.6, 1],
        delay: anime.stagger(30),
        easing: MOTION.easeSoft,
        duration: MOTION.durationFast
      });
    });
  });
}

function applyProjectFilter(filter) {
  const cards = Array.from(document.querySelectorAll('.projects-grid .project-card'));
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
  if (status) status.textContent = `Showing ${shown} of ${cards.length} projects (${activeProjectFilter === 'all' ? 'all categories' : activeProjectFilter})`;
  if (!isReduced()) {
    const visibleCards = cards.filter((card) => !card.classList.contains('is-hidden'));
    anime.remove(visibleCards);
    anime({
      targets: visibleCards,
      opacity: [0, 1],
      translateY: [12, 0],
      easing: MOTION.easePrimary,
      duration: MOTION.durationFast + 80,
      delay: anime.stagger(48)
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

function fetchProjects() {
  // Populate map with fallback initially
  projectMap.clear();
  projectRegistry.forEach((item) => projectMap.set(item.id, item));

  fetch('/projects.json')
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
    .then((data) => {
      const normalized = Array.isArray(data)
        ? data.map((item) => ({
            id: toId(item?.id),
            domain: toText(item?.domain, 'web'),
            githubUrl: toSafeGithubUrl(item?.githubUrl)
          })).filter((item) => item.id)
        : [];
      projectRegistry = normalized.length ? normalized : FALLBACK_PROJECTS.slice();
    })
    .catch((error) => {
      console.warn('[main] using fallback project registry', error);
      projectRegistry = FALLBACK_PROJECTS.slice();
    })
    .finally(() => {
      projectMap.clear();
      projectRegistry.forEach((item) => projectMap.set(item.id, item));
      syncProjectCards();

      // Dispatch event for three-scene.js
      window.dispatchEvent(new CustomEvent('warp:project-registry', { detail: { projects: projectRegistry } }));
    });
}

function syncProjectCards() {
  const cards = Array.from(document.querySelectorAll('.projects-grid .project-card'));
  cards.forEach((card, index) => {
    const id = toId(card.dataset.projectId) || FALLBACK_PROJECTS[index]?.id || '';
    if (!id) return;
    card.dataset.projectId = id;
    const source = projectMap.get(id) || FALLBACK_PROJECTS[index];
    if (source?.domain && !toText(card.dataset.domain)) card.dataset.domain = source.domain;
    const link = card.querySelector('.project-link');
    if (link && source?.githubUrl) {
      link.href = toSafeGithubUrl(source.githubUrl);
      link.rel = 'noopener noreferrer';
      link.removeAttribute('target');
    }
  });
  applyProjectFilter(activeProjectFilter);
}
