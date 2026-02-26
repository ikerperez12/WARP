import anime from 'animejs/lib/anime.es.js';
import { initThreeScene } from './three-scene.js';

const VISUAL_PREFS_KEY = 'warp.visualPrefs';

function readVisualPrefs() {
  const defaults = { grain: 'on', cursor: 'on', motion: 'full' };
  try {
    const raw = localStorage.getItem(VISUAL_PREFS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      grain: parsed.grain === 'off' ? 'off' : 'on',
      cursor: parsed.cursor === 'off' ? 'off' : 'on',
      motion: parsed.motion === 'reduced' ? 'reduced' : 'full',
    };
  } catch {
    return defaults;
  }
}

function saveVisualPrefs(prefs) {
  try {
    localStorage.setItem(VISUAL_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage failures.
  }
}

function applyVisualPrefs(prefs) {
  document.body.dataset.grain = prefs.grain;
  document.body.dataset.cursor = prefs.cursor;
  document.body.dataset.motion = prefs.motion;
}

// ========================================
// Initialize Three.js Scene
// ========================================
const visualPrefs = readVisualPrefs();
applyVisualPrefs(visualPrefs);
initThreeScene();

// ========================================
// Wait for DOM
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const MOTION = {
    easePrimary: 'easeOutCubic',
    easeSoft: 'easeOutQuad',
    easeInOut: 'easeInOutSine',
    durationFast: 360,
    durationBase: 560,
    durationMedium: 760,
    durationSlow: 1100,
  };

  function isMotionReduced() {
    return document.body.dataset.motion === 'reduced' || reducedMotionMedia.matches;
  }

  const FALLBACK_PROJECTS = [
    {
      id: 'hero_motion_engine',
      name: 'Hero Motion Engine',
      description: 'Coreografia del hero: intro, loops y parallax.',
      language: 'JavaScript',
      stack: ['Three.js', 'Anime.js'],
      githubUrl: 'https://github.com/ikerperez12',
    },
    {
      id: 'scene_laptop_render',
      name: 'Laptop Scene Render',
      description: 'Pipeline visual del portatil 3D con materiales y luces.',
      language: 'JavaScript',
      stack: ['Three.js', 'PBR'],
      githubUrl: 'https://github.com/ikerperez12',
    },
    {
      id: 'scroll_driven_fx',
      name: 'Scroll Driven FX',
      description: 'Transiciones por scroll y narrativa visual.',
      language: 'JavaScript',
      stack: ['Timeline', 'IntersectionObserver'],
      githubUrl: 'https://github.com/ikerperez12',
    },
    {
      id: 'terminal_runtime',
      name: 'Terminal Runtime',
      description: 'Terminal simulada con comandos y estado.',
      language: 'JavaScript',
      stack: ['Canvas UI'],
      githubUrl: 'https://github.com/ikerperez12',
    },
  ];
  const DEFAULT_GITHUB_URL = 'https://github.com/ikerperez12';

  let projectRegistry = FALLBACK_PROJECTS.slice();
  const liveRegion = document.getElementById('app-live-region');
  let liveTimer = 0;

  function announceLive(message) {
    if (!liveRegion || !message) return;
    window.clearTimeout(liveTimer);
    liveRegion.textContent = '';
    liveTimer = window.setTimeout(() => {
      liveRegion.textContent = message;
    }, 30);
  }

  function sanitizeText(value, fallback = '') {
    if (typeof value !== 'string') return fallback;
    const cleaned = value.replace(/\s+/g, ' ').trim();
    return cleaned || fallback;
  }

  function sanitizeProjectId(value) {
    const normalized = sanitizeText(value).toLowerCase();
    if (!normalized) return '';
    return normalized.replace(/[^a-z0-9_-]/g, '_').slice(0, 80);
  }

  function sanitizeStack(items) {
    if (!Array.isArray(items)) return [];
    return items.map((item) => sanitizeText(item)).filter(Boolean).slice(0, 8);
  }

  function toSafeGithubUrl(value) {
    if (typeof value !== 'string') return DEFAULT_GITHUB_URL;
    try {
      const parsed = new URL(value, window.location.origin);
      if (parsed.protocol !== 'https:') return DEFAULT_GITHUB_URL;
      if (parsed.username || parsed.password) return DEFAULT_GITHUB_URL;
      return parsed.toString();
    } catch {
      return DEFAULT_GITHUB_URL;
    }
  }

  function normalizeProjects(raw) {
    if (!Array.isArray(raw)) return FALLBACK_PROJECTS.slice();
    const cleaned = raw
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const id = sanitizeProjectId(item.id);
        const name = sanitizeText(item.name);
        if (!id || !name) return null;
        return {
          id,
          name,
          description: sanitizeText(item.description, 'Proyecto interactivo disponible en terminal.'),
          language: sanitizeText(item.language, 'N/A'),
          stack: sanitizeStack(item.stack),
          githubUrl: toSafeGithubUrl(item.githubUrl),
        };
      })
      .filter(Boolean);

    return cleaned.length > 0 ? cleaned : FALLBACK_PROJECTS.slice();
  }

  // ========================================
  // Preloader
  // ========================================
  const preloader = document.getElementById('preloader');
  const preloaderFill = document.getElementById('preloader-fill');
  if (preloader && preloaderFill) {
    requestAnimationFrame(() => {
      preloaderFill.style.width = '100%';
      setTimeout(() => preloader.classList.add('is-hidden'), 620);
    });
  }

  // ========================================
  // Visual settings panel
  // ========================================
  const uiToggle = document.getElementById('ui-toggle');
  const uiPanel = document.getElementById('ui-panel');
  const grainState = document.getElementById('grain-state');
  const cursorState = document.getElementById('cursor-state');
  const motionState = document.getElementById('motion-state');
  const projectModal = document.getElementById('project-modal');
  const projectModalClose = document.getElementById('project-modal-close');
  const projectModalList = document.getElementById('project-modal-list');
  const pcShell = document.getElementById('pc-shell');
  const pcShellClose = document.getElementById('pc-shell-close');
  const pcShellProjects = document.getElementById('pc-shell-projects');
  const pcShellFocusTerminal = document.getElementById('pc-shell-focus-terminal');
  const pcShellOpenList = document.getElementById('pc-shell-open-list');
  const CARD_PROJECT_IDS = [
    'hero_motion_engine',
    'scene_laptop_render',
    'terminal_runtime',
    'scroll_driven_fx',
    'hero_motion_engine',
    'scene_laptop_render',
  ];

  function renderProjectList() {
    if (!projectModalList) return;
    projectModalList.replaceChildren();
    const fragment = document.createDocumentFragment();

    projectRegistry.forEach((project) => {
      const stack = project.stack.length > 0 ? project.stack.join(' - ') : 'Stack no definido';
      const safeDesc = project.description || 'Proyecto interactivo disponible en terminal.';

      const button = document.createElement('button');
      button.className = 'project-launch';
      button.type = 'button';
      button.dataset.projectId = project.id;

      const titleEl = document.createElement('span');
      titleEl.className = 'project-launch-title';
      titleEl.textContent = project.name;

      const metaEl = document.createElement('span');
      metaEl.className = 'project-launch-meta';
      metaEl.textContent = `${project.language} - ${stack}`;

      const descEl = document.createElement('span');
      descEl.className = 'project-launch-meta';
      descEl.textContent = safeDesc;

      button.append(titleEl, metaEl, descEl);
      fragment.appendChild(button);
    });

    projectModalList.appendChild(fragment);

    projectModalList.querySelectorAll('.project-launch').forEach((button) => {
      button.addEventListener('click', () => {
        const projectId = button.getAttribute('data-project-id');
        if (!projectId) return;
        openPcShell();
        window.dispatchEvent(new CustomEvent('warp:terminal-run-project', { detail: { projectId, source: 'list' } }));
        announceLive(`Ejecutando proyecto ${projectId}`);
        closeProjectModal();
      });
    });

    return;
  }

  function openProjectModal() {
    if (!projectModal) return;
    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstButton = projectModalList?.querySelector('.project-launch');
    if (firstButton) firstButton.focus();
  }

  function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openPcShell() {
    if (!pcShell) return;
    pcShell.classList.add('open');
    pcShell.setAttribute('aria-hidden', 'false');
  }

  function closePcShell() {
    if (!pcShell) return;
    pcShell.classList.remove('open');
    pcShell.setAttribute('aria-hidden', 'true');
  }

  function renderPcShellProjects() {
    if (!pcShellProjects) return;
    pcShellProjects.replaceChildren();
    const fragment = document.createDocumentFragment();

    projectRegistry.forEach((project) => {
      const stack = project.stack.length ? project.stack.join(' - ') : 'Stack';

      const article = document.createElement('article');
      article.className = 'pc-shell-project';

      const nameEl = document.createElement('span');
      nameEl.className = 'pc-shell-project-name';
      nameEl.textContent = project.name;

      const metaEl = document.createElement('span');
      metaEl.className = 'pc-shell-project-meta';
      metaEl.textContent = `${project.language} - ${stack}`;

      const actions = document.createElement('div');
      actions.className = 'pc-shell-project-actions';

      const runBtn = document.createElement('button');
      runBtn.type = 'button';
      runBtn.className = 'pc-shell-project-btn';
      runBtn.dataset.runProject = project.id;
      runBtn.textContent = 'Abrir en PC 3D';

      const githubLink = document.createElement('a');
      githubLink.className = 'pc-shell-project-link';
      githubLink.href = toSafeGithubUrl(project.githubUrl);
      githubLink.target = '_blank';
      githubLink.rel = 'noopener noreferrer';
      githubLink.textContent = 'Ver GitHub';

      actions.append(runBtn, githubLink);
      article.append(nameEl, metaEl, actions);
      fragment.appendChild(article);
    });

    pcShellProjects.appendChild(fragment);

    pcShellProjects.querySelectorAll('[data-run-project]').forEach((button) => {
      button.addEventListener('click', () => {
        const projectId = button.getAttribute('data-run-project');
        if (!projectId) return;
        openPcShell();
        window.dispatchEvent(new CustomEvent('warp:terminal-run-project', { detail: { projectId, source: 'pc-shell' } }));
        announceLive(`Proyecto ${projectId} abierto en PC 3D`);
      });
    });

    return;
  }

  function bindProjectCards() {
    const cards = Array.from(document.querySelectorAll('.projects-grid .project-card'));
    cards.forEach((card, index) => {
      const projectId = card.getAttribute('data-project-id') || CARD_PROJECT_IDS[index] || CARD_PROJECT_IDS[index % CARD_PROJECT_IDS.length];
      card.setAttribute('data-project-id', projectId);

      const overlay = card.querySelector('.project-overlay');
      const githubLink = card.querySelector('.project-link');
      if (githubLink) {
        githubLink.setAttribute('aria-label', 'Abrir repositorio en GitHub');
        githubLink.setAttribute('title', 'Abrir GitHub');
      }
      if (!overlay) return;
      if (overlay.querySelector('.project-open-3d')) return;

      const openBtn = document.createElement('button');
      openBtn.type = 'button';
      openBtn.className = 'project-open-3d';
      openBtn.textContent = 'Abrir en PC 3D';
      openBtn.setAttribute('aria-label', `Abrir ${projectId} en el PC 3D`);
      openBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openPcShell();
        window.dispatchEvent(new CustomEvent('warp:terminal-run-project', { detail: { projectId, source: 'project-card' } }));
        announceLive(`Abriendo ${projectId} en PC 3D`);
      });
      overlay.appendChild(openBtn);
    });
  }

  function syncVisualLabels() {
    if (grainState) grainState.textContent = visualPrefs.grain === 'on' ? 'On' : 'Off';
    if (cursorState) cursorState.textContent = visualPrefs.cursor === 'on' ? 'On' : 'Off';
    if (motionState) motionState.textContent = visualPrefs.motion === 'full' ? 'Full' : 'Reduced';
  }

  function commitVisualPrefs() {
    applyVisualPrefs(visualPrefs);
    saveVisualPrefs(visualPrefs);
    syncVisualLabels();
    enableCursor();
    if (visualPrefs.cursor === 'off') document.body.classList.remove('cursor-hover');
    window.dispatchEvent(new CustomEvent('warp:motion-mode', { detail: { mode: visualPrefs.motion } }));
  }

  syncVisualLabels();

  if (uiToggle && uiPanel) {
    uiToggle.addEventListener('click', () => {
      const open = uiPanel.classList.toggle('open');
      uiPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
      uiToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    uiPanel.querySelectorAll('.ui-option').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        let shouldCommit = false;
        if (action === 'toggle-grain') {
          visualPrefs.grain = visualPrefs.grain === 'on' ? 'off' : 'on';
          shouldCommit = true;
        } else if (action === 'toggle-cursor') {
          visualPrefs.cursor = visualPrefs.cursor === 'on' ? 'off' : 'on';
          shouldCommit = true;
        } else if (action === 'toggle-motion') {
          visualPrefs.motion = visualPrefs.motion === 'full' ? 'reduced' : 'full';
          shouldCommit = true;
        } else if (action === 'open-project-list') {
          uiPanel.classList.remove('open');
          uiPanel.setAttribute('aria-hidden', 'true');
          uiToggle.setAttribute('aria-expanded', 'false');
          openProjectModal();
        }
        if (shouldCommit) commitVisualPrefs();
      });
    });

    document.addEventListener('click', (event) => {
      if (!uiPanel.classList.contains('open')) return;
      if (uiPanel.contains(event.target) || uiToggle.contains(event.target)) return;
      uiPanel.classList.remove('open');
      uiPanel.setAttribute('aria-hidden', 'true');
      uiToggle.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (!uiPanel.classList.contains('open')) return;
      uiPanel.classList.remove('open');
      uiPanel.setAttribute('aria-hidden', 'true');
      uiToggle.setAttribute('aria-expanded', 'false');
    });
  }

  if (projectModalClose) {
    projectModalClose.addEventListener('click', closeProjectModal);
  }

  if (projectModal) {
    projectModal.addEventListener('click', (event) => {
      if (event.target === projectModal) closeProjectModal();
    });
  }

  window.addEventListener('warp:open-project-list', () => {
    closePcShell();
    openProjectModal();
  });

  if (pcShellClose) {
    pcShellClose.addEventListener('click', closePcShell);
  }

  if (pcShellFocusTerminal) {
    pcShellFocusTerminal.addEventListener('click', () => {
      openPcShell();
      window.dispatchEvent(new CustomEvent('warp:terminal-focus', { detail: { source: 'pc-shell' } }));
      announceLive('Terminal activa en el PC 3D');
    });
  }

  if (pcShellOpenList) {
    pcShellOpenList.addEventListener('click', () => {
      closePcShell();
      openProjectModal();
      announceLive('Lista completa de proyectos abierta');
    });
  }

  window.addEventListener('warp:pc-open', () => {
    openPcShell();
    renderPcShellProjects();
  });

  // ========================================
  // Custom cursor
  // ========================================
  const cursorEl = document.getElementById('custom-cursor');
  const cursorDotEl = document.getElementById('custom-cursor-dot');
  const interactiveSelector = 'a, button, .project-card, .timeline-item, .highlight, .skill-tag, input, textarea';

  function enableCursor() {
    if (!supportsFinePointer || visualPrefs.cursor === 'off' || !cursorEl || !cursorDotEl) {
      document.body.classList.remove('cursor-enabled');
      return;
    }
    document.body.classList.add('cursor-enabled');
  }

  enableCursor();
  commitVisualPrefs();

  async function bootstrapProjectRegistry() {
    try {
      const response = await fetch('/projects.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      projectRegistry = normalizeProjects(data);
    } catch (error) {
      projectRegistry = FALLBACK_PROJECTS.slice();
      console.warn('[main] project registry fallback in use:', error);
    }

    renderProjectList();
    renderPcShellProjects();
    bindProjectCards();
    window.dispatchEvent(new CustomEvent('warp:project-registry', { detail: { projects: projectRegistry } }));
  }

  let lastTerminalStatus = '';
  window.addEventListener('warp:terminal-status', (event) => {
    const detail = event?.detail || {};
    const status = typeof detail.status === 'string' ? detail.status : '';
    const projectName = typeof detail.projectName === 'string' ? detail.projectName : '';
    const statusKey = `${status}:${projectName}`;
    if (!status || statusKey === lastTerminalStatus) return;
    lastTerminalStatus = statusKey;

    if (status === 'loading' && projectName) announceLive(`Cargando ${projectName}`);
    if (status === 'running' && projectName) announceLive(`${projectName} en ejecucion`);
    if (status === 'idle' && projectName) announceLive(`${projectName} finalizado`);
    if (status === 'focus-on') announceLive('Terminal activa');
    if (status === 'focus-off') announceLive('Terminal desactivada');
    if (status === 'registry-loaded') announceLive('Registro de proyectos actualizado');
  });

  renderProjectList();
  renderPcShellProjects();
  bindProjectCards();
  bootstrapProjectRegistry();

  window.addEventListener('pointermove', (event) => {
    if (!document.body.classList.contains('cursor-enabled')) return;
    const { clientX, clientY } = event;
    cursorEl.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
    cursorDotEl.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
  }, { passive: true });

  document.addEventListener('pointerover', (event) => {
    if (!document.body.classList.contains('cursor-enabled')) return;
    const interactive = event.target.closest(interactiveSelector);
    document.body.classList.toggle('cursor-hover', Boolean(interactive));
  });

  document.addEventListener('pointerdown', () => {
    if (!document.body.classList.contains('cursor-enabled')) return;
    document.body.classList.add('cursor-hover');
  });

  document.addEventListener('pointerup', () => {
    document.body.classList.remove('cursor-hover');
  });

  // ========================================
  // Hero entrance animations
  // ========================================
  const heroElements = document.querySelectorAll('.hero-section .anim-fade-up');
  if (isMotionReduced()) {
    heroElements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  } else {
    heroElements.forEach(el => el.classList.add('animated'));
  }

  // ========================================
  // Typing Effect
  // ========================================
  const typedEl = document.getElementById('typed-text');
  if (typedEl) {
    const phrases = [
      'Inteligencia Artificial',
      'Desarrollo Full-Stack',
      'Ciberseguridad',
      'Sistemas Distribuidos',
      'Cloud & DevOps',
      'Machine Learning',
      'Open Source',
    ];

    if (isMotionReduced()) {
      typedEl.textContent = phrases[0];
    } else {
      let phraseIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      let typeSpeed = 80;

      function typeEffect() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
          typedEl.textContent = currentPhrase.substring(0, charIndex - 1);
          charIndex--;
          typeSpeed = 40;
        } else {
          typedEl.textContent = currentPhrase.substring(0, charIndex + 1);
          charIndex++;
          typeSpeed = 80;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
          typeSpeed = 2000;
          isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          typeSpeed = 400;
        }

        setTimeout(typeEffect, typeSpeed);
      }

      setTimeout(typeEffect, 1000);
    }
  }

  // ========================================
  // Stat Counter Animation
  // ========================================
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    if (isMotionReduced()) {
      statNumbers.forEach((stat) => {
        const target = parseInt(stat.dataset.target, 10);
        stat.textContent = Number.isFinite(target) ? String(target) : '0';
      });
      return;
    }

    statNumbers.forEach(stat => {
      const target = parseInt(stat.dataset.target, 10);
      const counter = { value: 0 };
      anime({
        targets: counter,
        value: target,
        round: 1,
        easing: MOTION.easePrimary,
        duration: MOTION.durationSlow + 300,
        delay: 500,
        update: () => {
          stat.textContent = String(counter.value);
        },
      });
    });
  }

  // Animate stats immediately since hero is visible
  setTimeout(animateStats, 800);

  // ========================================
  // Scroll Observer for Reveal Animations
  // ========================================
  const revealElements = document.querySelectorAll('.anim-reveal');
  if (isMotionReduced()) {
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger reveal using anime.js
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 80);

          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  if (!isMotionReduced()) {
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ========================================
  // Skill Bars Animation
  // ========================================
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  if (isMotionReduced()) {
    skillBars.forEach((bar) => {
      const width = bar.dataset.width;
      bar.style.width = `${width}%`;
      bar.setAttribute('aria-valuenow', width);
    });
  }

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const width = entry.target.dataset.width;
          anime({
            targets: entry.target,
            width: `${width}%`,
            easing: MOTION.easePrimary,
            duration: MOTION.durationSlow,
            delay: 300,
            update: () => {
              entry.target.setAttribute('aria-valuenow', width);
            },
          });
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  if (!isMotionReduced()) {
    skillBars.forEach(bar => skillObserver.observe(bar));
  }

  // ========================================
  // Stagger animations on skill tags
  // ========================================
  const skillCategories = document.querySelectorAll('.skill-category');
  if (isMotionReduced()) {
    skillCategories.forEach((category) => {
      const tags = category.querySelectorAll('.skill-tag');
      tags.forEach((tag) => {
        tag.style.opacity = '1';
        tag.style.transform = 'none';
      });
    });
  }

  const tagObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const tags = entry.target.querySelectorAll('.skill-tag');
          anime({
            targets: tags,
            scale: [0.8, 1],
            opacity: [0, 1],
            delay: anime.stagger(50, { start: 200 }),
            easing: MOTION.easePrimary,
            duration: MOTION.durationBase,
          });
          tagObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  if (!isMotionReduced()) {
    skillCategories.forEach(cat => tagObserver.observe(cat));
  }

  // ========================================
  // Project Card Hover Animations
  // ========================================
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (isMotionReduced()) return;
      anime({
        targets: card.querySelectorAll('.project-tags span'),
        translateY: [-4, 0],
        opacity: [0.5, 1],
        delay: anime.stagger(40),
        easing: MOTION.easeSoft,
        duration: MOTION.durationFast,
      });
    });
  });

  // ========================================
  // Navigation
  // ========================================
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');
  const heroSection = document.getElementById('hero');
  const heroContent = document.querySelector('.hero-content');
  const heroBadges = document.querySelector('.floating-badges');
  const heroScrollIndicator = document.querySelector('.scroll-indicator');
  const backToTop = document.getElementById('back-to-top');

  // Scroll detection for navbar
  window.addEventListener('scroll', () => {
    // Navbar background
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active section detection
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
      if (link.dataset.section === currentSection) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });

    // Scroll progress bar
    const scrollProgress = document.getElementById('scroll-progress');
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
    scrollProgress.style.width = `${scrollPercent}%`;

    if (backToTop) {
      backToTop.classList.toggle('visible', window.scrollY > 520);
    }

    // Hero transitional fade on left text block
    if (heroSection && heroContent) {
      const heroStart = heroSection.offsetTop;
      const heroRange = Math.max(heroSection.offsetHeight - window.innerHeight * 0.2, window.innerHeight * 0.9);
      const heroProgress = Math.max(0, Math.min(1, (window.scrollY - heroStart) / heroRange));

      const fadeStart = 0.26;
      const fadeEnd = 0.84;
      const fadeT = Math.max(0, Math.min(1, (heroProgress - fadeStart) / (fadeEnd - fadeStart)));

      if (isMotionReduced()) {
        heroContent.style.opacity = String(1 - fadeT * 0.28);
        heroContent.style.transform = 'none';
        heroContent.style.filter = 'none';
        if (heroBadges) {
          heroBadges.style.opacity = String(1 - fadeT * 0.35);
          heroBadges.style.transform = 'none';
        }
        if (heroScrollIndicator) {
          heroScrollIndicator.style.opacity = String(1 - fadeT * 0.58);
          heroScrollIndicator.style.transform = 'none';
        }
      } else {
        const textOpacity = 1 - fadeT;
        const translateX = -26 * fadeT;
        const blurPx = 4 * fadeT;

        heroContent.style.opacity = String(textOpacity);
        heroContent.style.transform = `translate3d(${translateX}px, 0, 0)`;
        heroContent.style.filter = `blur(${blurPx}px)`;

        if (heroBadges) {
          heroBadges.style.opacity = String(1 - fadeT * 0.75);
          heroBadges.style.transform = `translate3d(${translateX * 0.6}px, 0, 0)`;
        }

        if (heroScrollIndicator) {
          heroScrollIndicator.style.opacity = String(1 - fadeT);
          heroScrollIndicator.style.transform = `translate3d(0, ${20 * fadeT}px, 0)`;
        }
      }
    }
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: isMotionReduced() ? 'auto' : 'smooth' });
    });
  }

  // ========================================
  // Mobile Menu
  // ========================================
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function setMobileMenuState(open) {
    navToggle.classList.toggle('active', open);
    mobileMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  navToggle.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('open');
    setMobileMenuState(open);

    if (open) {
      if (isMotionReduced()) {
        document.querySelectorAll('.mobile-link').forEach((link) => {
          link.style.opacity = '1';
          link.style.transform = 'none';
        });
      } else {
        anime({
          targets: '.mobile-link',
          translateX: [50, 0],
          opacity: [0, 1],
          delay: anime.stagger(80, { start: 200 }),
          easing: MOTION.easePrimary,
          duration: MOTION.durationBase,
        });
      }
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      setMobileMenuState(false);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (projectModal?.classList.contains('open')) {
      closeProjectModal();
      return;
    }
    if (pcShell?.classList.contains('open')) {
      closePcShell();
      return;
    }
    if (!mobileMenu.classList.contains('open')) return;
    setMobileMenuState(false);
  });

  // ========================================
  // Smooth scroll for anchor links
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: isMotionReduced() ? 'auto' : 'smooth' });
      }
    });
  });

  // ========================================
  // Contact Form
  // ========================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('.btn');
      const originalText = btn.querySelector('span').textContent;
      btn.querySelector('span').textContent = 'Mensaje enviado! OK';

      if (!isMotionReduced()) {
        anime({
          targets: btn,
          scale: [1, 1.03, 1],
          duration: MOTION.durationBase,
          easing: MOTION.easeInOut,
        });
      }

      setTimeout(() => {
        btn.querySelector('span').textContent = originalText;
        contactForm.reset();
      }, 3000);
    });
  }

  // ========================================
  // Timeline hover animations
  // ========================================
  document.querySelectorAll('.timeline-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      if (isMotionReduced()) return;
      anime({
        targets: item.querySelector('.timeline-tags span'),
        scale: [0.94, 1],
        opacity: [0.7, 1],
        delay: anime.stagger(30),
        easing: MOTION.easeSoft,
        duration: MOTION.durationFast,
      });
    });
  });

  // ========================================
  // Parallax effect on About highlights
  // ========================================
  const highlights = document.querySelectorAll('.highlight');
  if (isMotionReduced()) {
    highlights.forEach((highlight) => {
      highlight.style.opacity = '1';
      highlight.style.transform = 'none';
    });
  }

  const highlightObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          anime({
            targets: entry.target,
            translateX: [22, 0],
            opacity: [0, 1],
            easing: MOTION.easePrimary,
            duration: MOTION.durationMedium,
            delay: [...highlights].indexOf(entry.target) * 150,
          });
          highlightObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  if (!isMotionReduced()) {
    highlights.forEach(h => highlightObserver.observe(h));
  }

  // ========================================
  // Code window typing animation
  // ========================================
  const codeWindow = document.querySelector('.code-content');
  if (codeWindow) {
    if (isMotionReduced()) {
      const codeNode = document.querySelector('.code-content code');
      if (codeNode) {
        codeNode.style.opacity = '1';
        codeNode.style.transform = 'none';
      }
    }

    const codeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            anime({
              targets: '.code-content code',
              opacity: [0, 1],
              translateY: [8, 0],
              easing: MOTION.easePrimary,
              duration: MOTION.durationMedium,
              delay: 300,
            });
            codeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (!isMotionReduced()) {
      codeObserver.observe(codeWindow);
    }
  }

  // ========================================
  // Contact cards stagger
  // ========================================
  const contactCards = document.querySelectorAll('.contact-card');
  if (isMotionReduced()) {
    contactCards.forEach((card) => {
      card.style.opacity = '1';
      card.style.transform = 'none';
    });
  }

  const contactObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          anime({
            targets: contactCards,
            translateX: [-24, 0],
            opacity: [0, 1],
            delay: anime.stagger(100, { start: 200 }),
            easing: MOTION.easePrimary,
            duration: MOTION.durationMedium,
          });
          contactObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  if (!isMotionReduced() && contactCards.length > 0) {
    contactObserver.observe(contactCards[0]);
  }
});
