import anime from 'animejs/lib/anime.es.js';
import { initThreeScene } from './three-scene.js';

const VISUAL_PREFS_KEY = 'warp.visualPrefs';
const DEFAULT_PREFS = { grain: 'on', cursor: 'on', motion: 'full' };
const FALLBACK_PROJECTS = [
  { id: 'fullstack-product-engineering', domain: 'web frontend ux core production', githubUrl: 'https://github.com/ikerperez12' },
  { id: 'ia-ml-nlp-lab', domain: 'ai data exploratory', githubUrl: 'https://github.com/ikerperez12' },
  { id: 'cybersecurity-lab', domain: 'security backend core production', githubUrl: 'https://github.com/ikerperez12' },
  { id: 'cloud-cicd-automation', domain: 'cloud backend production', githubUrl: 'https://github.com/ikerperez12' },
  { id: 'data-architecture-sql', domain: 'backend data core exploratory', githubUrl: 'https://github.com/ikerperez12' },
  { id: 'systems-hardware-infra', domain: 'backend systems production core', githubUrl: 'https://github.com/ikerperez12' },
];

const toText = (value, fallback = '') => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() || fallback : fallback);
const toId = (value) => toText(value).toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 80);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function toSafeGithubUrl(value) {
  const fallback = 'https://github.com/ikerperez12';
  if (typeof value !== 'string') return fallback;
  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
}

function readVisualPrefs() {
  try {
    const raw = localStorage.getItem(VISUAL_PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return {
      grain: parsed.grain === 'off' ? 'off' : 'on',
      cursor: parsed.cursor === 'off' ? 'off' : 'on',
      motion: parsed.motion === 'reduced' ? 'reduced' : 'full',
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function saveVisualPrefs(prefs) {
  try {
    localStorage.setItem(VISUAL_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors.
  }
}

function applyVisualPrefs(prefs) {
  document.body.dataset.grain = prefs.grain;
  document.body.dataset.cursor = prefs.cursor;
  document.body.dataset.motion = prefs.motion;
}

const visualPrefs = readVisualPrefs();
applyVisualPrefs(visualPrefs);
const disposeThreeScene = initThreeScene();
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (typeof disposeThreeScene === 'function') disposeThreeScene();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const MOTION = {
    easePrimary: 'easeOutCubic',
    easeSoft: 'easeOutQuad',
    easeInOut: 'easeInOutSine',
    durationFast: 320,
    durationBase: 520,
    durationSlow: 920,
  };
  const isReduced = () => reducedMotionMedia.matches || document.body.dataset.motion === 'reduced';

  let activeProjectFilter = 'all';
  let activeServiceFilter = 'all';
  let projectRegistry = FALLBACK_PROJECTS.slice();
  let scrollTicking = false;

  const liveRegion = document.getElementById('app-live-region');
  let liveTimer = 0;
  const announce = (message) => {
    if (!liveRegion || !message) return;
    clearTimeout(liveTimer);
    liveRegion.textContent = '';
    liveTimer = window.setTimeout(() => {
      liveRegion.textContent = message;
    }, 40);
  };

  const syncVisualLabels = () => {
    const grain = document.getElementById('grain-state');
    const cursor = document.getElementById('cursor-state');
    const motion = document.getElementById('motion-state');
    if (grain) grain.textContent = visualPrefs.grain === 'on' ? 'On' : 'Off';
    if (cursor) cursor.textContent = visualPrefs.cursor === 'on' ? 'On' : 'Off';
    if (motion) motion.textContent = visualPrefs.motion === 'full' ? 'Full' : 'Reduced';
  };

  const setCursorEnabled = () => {
    const enabled = supportsFinePointer && visualPrefs.cursor === 'on' && document.getElementById('custom-cursor') && document.getElementById('custom-cursor-dot');
    document.body.classList.toggle('cursor-enabled', Boolean(enabled));
    if (!enabled) document.body.classList.remove('cursor-hover');
  };

  const bindMagneticButtons = () => {
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
  };

  const commitVisualPrefs = () => {
    applyVisualPrefs(visualPrefs);
    saveVisualPrefs(visualPrefs);
    syncVisualLabels();
    setCursorEnabled();
    bindMagneticButtons();
    window.dispatchEvent(new CustomEvent('warp:motion-mode', { detail: { mode: visualPrefs.motion } }));
  };

  const uiToggle = document.getElementById('ui-toggle');
  const uiPanel = document.getElementById('ui-panel');
  if (uiToggle && uiPanel) {
    const closePanel = () => {
      uiPanel.classList.remove('open');
      uiPanel.setAttribute('aria-hidden', 'true');
      uiToggle.setAttribute('aria-expanded', 'false');
    };
    uiToggle.addEventListener('click', () => {
      const open = uiPanel.classList.toggle('open');
      uiPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
      uiToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    uiPanel.querySelectorAll('.ui-option').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-action');
        if (action === 'toggle-grain') visualPrefs.grain = visualPrefs.grain === 'on' ? 'off' : 'on';
        if (action === 'toggle-cursor') visualPrefs.cursor = visualPrefs.cursor === 'on' ? 'off' : 'on';
        if (action === 'toggle-motion') visualPrefs.motion = visualPrefs.motion === 'full' ? 'reduced' : 'full';
        commitVisualPrefs();
      });
    });
    document.addEventListener('click', (event) => {
      if (!uiPanel.classList.contains('open')) return;
      if (uiPanel.contains(event.target) || uiToggle.contains(event.target)) return;
      closePanel();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePanel();
    });
  }
  commitVisualPrefs();

  const preloader = document.getElementById('preloader');
  const preloaderFill = document.getElementById('preloader-fill');
  if (preloader && preloaderFill) {
    requestAnimationFrame(() => {
      preloaderFill.style.width = '100%';
      window.setTimeout(() => preloader.classList.add('is-hidden'), 620);
    });
  }

  const ticker = document.getElementById('tech-ticker-track');
  if (ticker && ticker.dataset.cloned !== 'true') {
    ticker.append(...Array.from(ticker.children).map((node) => node.cloneNode(true)));
    ticker.dataset.cloned = 'true';
  }

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

  const revealNodes = Array.from(document.querySelectorAll('.anim-reveal'));
  if (isReduced()) {
    revealNodes.forEach((node) => node.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;
        window.setTimeout(() => entry.target.classList.add('visible'), index * 70);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -48px 0px' });
    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  const heroFadeNodes = document.querySelectorAll('.hero-section .anim-fade-up');
  if (isReduced()) {
    heroFadeNodes.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  } else {
    heroFadeNodes.forEach((el) => el.classList.add('animated'));
  }

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
        anime({ targets: counter, value: target, round: 1, easing: MOTION.easePrimary, duration: MOTION.durationSlow, update: () => { node.textContent = String(counter.value); } });
      });
    }, 700);
  }

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
      anime({ targets: visibleCards, opacity: [0, 1], translateY: [12, 0], easing: MOTION.easePrimary, duration: MOTION.durationFast + 80, delay: anime.stagger(48) });
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
  applyProjectFilter(activeProjectFilter);
  applyServiceFilter(activeServiceFilter);

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
      anime({ targets: card.querySelectorAll('.project-tags span'), translateY: [-4, 0], opacity: [0.6, 1], delay: anime.stagger(30), easing: MOTION.easeSoft, duration: MOTION.durationFast });
    });
  });

  const projectMap = new Map(projectRegistry.map((project) => [project.id, project]));
  const syncProjectCards = () => {
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
  };

  fetch('/projects.json')
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
    .then((data) => {
      const normalized = Array.isArray(data)
        ? data.map((item) => ({ id: toId(item?.id), domain: toText(item?.domain, 'web'), githubUrl: toSafeGithubUrl(item?.githubUrl) })).filter((item) => item.id)
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
    });

  const navbar = document.getElementById('navbar');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = Array.from(document.querySelectorAll('.section'));
  const progressBar = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('back-to-top');
  const heroSection = document.getElementById('hero');
  const heroContent = document.querySelector('.hero-content');
  const heroBadges = document.querySelector('.floating-badges');
  const heroScrollIndicator = document.querySelector('.scroll-indicator');
  const showcaseScroll = document.getElementById('showcase-scroll');
  const showcaseStage = document.getElementById('showcase-stage');
  const showcaseFrames = Array.from(document.querySelectorAll('.showcase-frame'));
  const showcaseSteps = Array.from(document.querySelectorAll('#showcase-steps .showcase-step'));
  const showcaseProgressBar = document.getElementById('showcase-progress-bar');
  const showcaseCaption = document.getElementById('showcase-caption');

  const updateShowcaseSequence = (progress) => {
    if (!showcaseFrames.length) return;
    const reduced = isReduced();
    const frameCount = showcaseFrames.length;
    const maxIndex = Math.max(frameCount - 1, 1);
    const timelinePosition = progress * maxIndex;
    const lowerIndex = Math.floor(timelinePosition);
    const upperIndex = Math.min(frameCount - 1, lowerIndex + 1);
    const blend = timelinePosition - lowerIndex;
    const activeIndex = Math.round(timelinePosition);

    showcaseFrames.forEach((frame, index) => {
      let opacity = 0;
      if (reduced) {
        opacity = index === activeIndex ? 1 : 0;
        frame.style.transform = 'none';
      } else {
        if (index === lowerIndex) opacity = 1 - blend;
        else if (index === upperIndex) opacity = blend;
        const depth = index - timelinePosition;
        const translateX = clamp(depth * -18, -56, 56);
        const translateY = Math.min(86, Math.abs(depth) * 24);
        const scale = 1 - Math.min(0.22, Math.abs(depth) * 0.04);
        const rotate = clamp(depth * 1.8, -7, 7);
        frame.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
      }
      frame.style.opacity = opacity.toFixed(3);
      frame.classList.toggle('is-active', index === activeIndex);
    });

    if (showcaseSteps.length) {
      const stepIndex = Math.min(showcaseSteps.length - 1, Math.round(progress * (showcaseSteps.length - 1)));
      showcaseSteps.forEach((step, index) => {
        const active = index === stepIndex;
        step.classList.toggle('is-active', active);
        if (active) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
      });
    }

    if (showcaseProgressBar) showcaseProgressBar.style.width = `${(progress * 100).toFixed(1)}%`;
    if (showcaseCaption) showcaseCaption.textContent = `Plano ${Math.min(frameCount, activeIndex + 1)} de ${frameCount}`;
  };

  const onScroll = () => {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', y > 50);
    if (progressBar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = `${h > 0 ? (y / h) * 100 : 0}%`;
    }
    if (backToTop) backToTop.classList.toggle('visible', y > 520);

    let current = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 110;
      const height = section.offsetHeight;
      if (y >= top && y < top + height) current = section.id;
    });
    navLinks.forEach((link) => {
      const active = link.dataset.section === current;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    if (heroSection && heroContent) {
      const start = heroSection.offsetTop;
      const range = Math.max(heroSection.offsetHeight - window.innerHeight * 0.2, window.innerHeight * 0.9);
      const heroProgress = clamp((y - start) / range, 0, 1);
      const fade = clamp((heroProgress - 0.26) / (0.84 - 0.26), 0, 1);
      if (isReduced()) {
        heroContent.style.opacity = String(1 - fade * 0.28);
        heroContent.style.transform = 'none';
        heroContent.style.filter = 'none';
      } else {
        heroContent.style.opacity = String(1 - fade);
        heroContent.style.transform = `translate3d(${-26 * fade}px, 0, 0)`;
        heroContent.style.filter = `blur(${4 * fade}px)`;
      }
      if (heroBadges) heroBadges.style.opacity = String(1 - fade * 0.75);
      if (heroScrollIndicator) heroScrollIndicator.style.opacity = String(1 - fade);
    }

    if (showcaseScroll && showcaseStage && showcaseFrames.length) {
      const rect = showcaseScroll.getBoundingClientRect();
      const range = Math.max(rect.height - window.innerHeight, 1);
      const showcaseProgress = clamp(-rect.top / range, 0, 1);
      showcaseStage.style.setProperty('--showcase-progress', showcaseProgress.toFixed(3));
      updateShowcaseSequence(showcaseProgress);
    }
  };

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      onScroll();
      scrollTicking = false;
    });
  }, { passive: true });
  onScroll();
  window.addEventListener('warp:motion-mode', onScroll);
  if (typeof reducedMotionMedia.addEventListener === 'function') reducedMotionMedia.addEventListener('change', onScroll);
  else if (typeof reducedMotionMedia.addListener === 'function') reducedMotionMedia.addListener(onScroll);
  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: isReduced() ? 'auto' : 'smooth' }));

  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = Array.from(document.querySelectorAll('.mobile-link'));
  if (navToggle && mobileMenu) {
    const setMenu = (open) => {
      navToggle.classList.toggle('active', open);
      mobileMenu.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    navToggle.addEventListener('click', () => {
      const open = !mobileMenu.classList.contains('open');
      setMenu(open);
      if (open && !isReduced()) {
        anime({ targets: '.mobile-link', translateX: [42, 0], opacity: [0, 1], delay: anime.stagger(70, { start: 160 }), easing: MOTION.easePrimary, duration: MOTION.durationBase });
      }
    });
    mobileLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileMenu.classList.contains('open')) setMenu(false);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: isReduced() ? 'auto' : 'smooth' });
    });
  });

  const contactForm = document.getElementById('contact-form');
  const contactStatus = document.getElementById('contact-status');
  const contactSuccess = document.getElementById('contact-success');
  const contactError = document.getElementById('contact-error');
  if (contactSuccess) contactSuccess.classList.add('is-hidden');
  if (contactError) contactError.classList.add('is-hidden');

  if (contactForm) {
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const submitText = submitButton?.querySelector('span');
    const idleText = submitText?.textContent || 'Enviar mensaje';
    const fallbackMailLink = document.querySelector('.contact-card a[href^="mailto:"]');
    const fallbackRecipient = (() => {
      const href = toText(fallbackMailLink?.getAttribute('href') || '');
      if (!href.toLowerCase().startsWith('mailto:')) return '';
      return toText(href.slice(7).split('?')[0]);
    })();
    const setFormStatus = (message, mode) => {
      if (!contactStatus) return;
      contactStatus.textContent = message;
      contactStatus.classList.remove('is-success', 'is-error');
      if (mode === 'success') contactStatus.classList.add('is-success');
      if (mode === 'error') contactStatus.classList.add('is-error');
    };
    const sendViaFormSubmitClient = async ({ topic, name, email, message }) => {
      if (!fallbackRecipient) throw new Error('No hay correo de destino configurado para el respaldo.');

      const body = new URLSearchParams({
        _subject: `Portfolio contact [${topic}] - ${name}`,
        _replyto: email,
        _template: 'table',
        _captcha: 'false',
        topic,
        name,
        email,
        message,
      });

      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(fallbackRecipient)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', Accept: 'application/json' },
        body: body.toString(),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = toText(payload?.message || payload?.error, `Error ${response.status}`);
        const normalized = detail.toLowerCase();
        if (response.status === 403 && (normalized.includes('activate') || normalized.includes('activation'))) {
          throw new Error('FormSubmit requiere activar el receptor. Abre el correo de activacion y confirma el formulario.');
        }
        throw new Error(`FormSubmit fallo: ${detail}`);
      }

      const successFlag = String(payload?.success ?? '').toLowerCase();
      if (successFlag === 'false') {
        throw new Error(toText(payload?.message, 'FormSubmit reporto un fallo de entrega.'));
      }
    };
    const openMailtoDraft = ({ topic, name, email, message }) => {
      if (!fallbackRecipient) return false;
      const subject = encodeURIComponent(`Portfolio contact [${topic}] - ${name}`);
      const body = encodeURIComponent([
        `Categoria: ${topic}`,
        `Nombre: ${name}`,
        `Email: ${email}`,
        '',
        'Mensaje:',
        message,
      ].join('\n'));
      window.location.href = `mailto:${fallbackRecipient}?subject=${subject}&body=${body}`;
      return true;
    };

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const topic = toText(contactForm.querySelector('#topic')?.value || '');
      const name = toText(contactForm.querySelector('#name')?.value || '');
      const email = toText(contactForm.querySelector('#email')?.value || '');
      const message = toText(contactForm.querySelector('#message')?.value || '');
      const website = toText(contactForm.querySelector('#website')?.value || '');
      if (contactSuccess) contactSuccess.classList.add('is-hidden');
      if (contactError) contactError.classList.add('is-hidden');

      if (!topic || !name || !email || !message) {
        setFormStatus('Completa categoria, nombre, email y mensaje.', 'error');
        if (contactError) contactError.classList.remove('is-hidden');
        announce('Contact form has missing fields.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFormStatus('El email no es valido.', 'error');
        announce('Invalid email format.');
        return;
      }

      if (submitButton) submitButton.disabled = true;
      if (submitText) submitText.textContent = 'Enviando...';
      setFormStatus('Enviando mensaje de forma segura...', '');

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ topic, name, email, message, website }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          const code = toText(payload?.code);
          const shouldTryBrowserFallback =
            code === 'provider_configuration_error' ||
            code === 'email_delivery_failed' ||
            response.status >= 500;

          if (shouldTryBrowserFallback) {
            try {
              await sendViaFormSubmitClient({ topic, name, email, message });
              setFormStatus('Mensaje enviado por plataforma de respaldo. Te respondere pronto.', 'success');
              if (contactSuccess) contactSuccess.classList.remove('is-hidden');
              contactForm.reset();
              announce('Message sent successfully via fallback provider.');
              return;
            } catch (fallbackError) {
              const fallbackMessage = toText(fallbackError?.message, '');
              if (fallbackMessage) {
                const opened = openMailtoDraft({ topic, name, email, message });
                if (opened) {
                  setFormStatus(
                    `${fallbackMessage} Se abrio tu cliente de correo como respaldo final.`,
                    'error'
                  );
                  if (contactError) contactError.classList.remove('is-hidden');
                  announce('Mail client fallback opened.');
                  return;
                }
              }
              throw fallbackError;
            }
          }

          throw new Error(toText(payload?.error, `Error ${response.status}`));
        }
        setFormStatus('Mensaje enviado. Te respondere pronto.', 'success');
        if (contactSuccess) contactSuccess.classList.remove('is-hidden');
        contactForm.reset();
        announce('Message sent successfully.');
      } catch (error) {
        setFormStatus(toText(error.message, 'No se pudo enviar el mensaje.'), 'error');
        if (contactError) contactError.classList.remove('is-hidden');
        announce('Message send failed.');
      } finally {
        if (submitButton) submitButton.disabled = false;
        if (submitText) submitText.textContent = idleText;
      }
    });
  }
});
