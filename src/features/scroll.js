import { isReduced, reducedMotionMedia } from '../utils/motion.js';
import { clamp } from '../utils/math.js';

let scrollTicking = false;
const isEditorialHome = () => document.body.classList.contains('home-editorial');

export function initScroll() {
  initRevealAnimations();
  if (!isEditorialHome()) initHeroFade();
  initAnchorLinks();
  onScroll();

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      onScroll();
      scrollTicking = false;
    });
  }, { passive: true });

  window.addEventListener('warp:motion-mode', onMotionChange);

  if (typeof reducedMotionMedia.addEventListener === 'function') reducedMotionMedia.addEventListener('change', onMotionChange);
  else if (typeof reducedMotionMedia.addListener === 'function') reducedMotionMedia.addListener(onMotionChange);
}

function onMotionChange() {
  initRevealAnimations();
  onScroll();
}

function onScroll() {
  const y = window.scrollY;
  updateNavbar(y);
  updateProgressBar(y);
  updateBackToTop(y);
  updateActiveSection(y);
  updateSectionParallax();
  updateTimelineProgress();
  if (isEditorialHome()) updateEditorialHero(y);
  else updateHeroEffects(y);
  updateShowcase(y);
}

function initRevealAnimations() {
  const revealNodes = Array.from(document.querySelectorAll('.anim-reveal'));
  revealNodes.forEach((node, index) => {
    node.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 70}ms`);
  });

  if (isReduced()) {
    revealNodes.forEach((node) => node.classList.add('visible'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -52px 0px' });

  revealNodes.forEach((node) => {
    if (node.classList.contains('visible')) return;
    revealObserver.observe(node);
  });
}

function initHeroFade() {
  const heroFadeNodes = document.querySelectorAll('.hero-section .anim-fade-up');
  if (isReduced()) {
    heroFadeNodes.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  } else {
    heroFadeNodes.forEach((el) => el.classList.add('animated'));
  }
}

function initAnchorLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      const navbar = document.getElementById('navbar');
      const navOffset = navbar ? navbar.offsetHeight + 18 : 18;
      const top = Math.max(target.getBoundingClientRect().top + window.scrollY - navOffset, 0);

      window.scrollTo({
        top,
        behavior: isReduced() ? 'auto' : 'smooth',
      });
    });
  });
}

function updateNavbar(y) {
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.classList.toggle('scrolled', y > 50);
}

function updateProgressBar(y) {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${h > 0 ? (y / h) * 100 : 0}%`;
}

function updateBackToTop(y) {
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) backToTop.classList.toggle('visible', y > 520);
}

function updateActiveSection(y) {
  const sections = Array.from(document.querySelectorAll('.section'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const railLinks = Array.from(document.querySelectorAll('.section-rail-nav a'));
  const railCount = document.querySelector('.section-rail-count');

  let current = '';
  let currentIndex = 0;
  sections.forEach((section) => {
    const top = section.offsetTop - 110;
    const height = section.offsetHeight;
    if (y >= top && y < top + height) {
      current = section.id;
      currentIndex = sections.indexOf(section);
    }
  });

  navLinks.forEach((link) => {
    const key = link.dataset.section || '';
    const active = key === current;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  railLinks.forEach((link) => {
    const active = (link.dataset.railTarget || '') === current;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  if (railCount && sections.length) {
    railCount.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}`;
  }

  document.body.dataset.activeSection = current || '';
}

function updateSectionParallax() {
  const sections = Array.from(document.querySelectorAll('.section'));
  if (isReduced()) {
    sections.forEach((section) => {
      section.style.setProperty('--section-shift', '0px');
      section.style.setProperty('--section-glow', '1');
    });
    return;
  }

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
    const shift = (0.5 - progress) * 18;
    section.style.setProperty('--section-shift', `${shift.toFixed(2)}px`);
    section.style.setProperty('--section-glow', progress.toFixed(3));
  });
}

function updateTimelineProgress() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  const rect = timeline.getBoundingClientRect();
  const progress = clamp((window.innerHeight * 0.72 - rect.top) / Math.max(rect.height, 1), 0, 1);
  timeline.style.setProperty('--timeline-progress', progress.toFixed(3));
}

function updateEditorialHero(y) {
  const heroSection = document.getElementById('hero');
  const heroShell = document.querySelector('.hero-shell');
  const heroContent = document.querySelector('.hero-content');
  const heroAside = document.querySelector('.hero-aside');
  const heroBadges = document.querySelector('.floating-badges');

  if (!heroSection || !heroShell || !heroContent) return;

  const rect = heroSection.getBoundingClientRect();
  const progress = clamp(-rect.top / Math.max(heroSection.offsetHeight * 0.9, 1), 0, 1);
  heroShell.style.setProperty('--hero-progress', progress.toFixed(3));

  if (isReduced()) {
    heroContent.style.transform = 'none';
    heroContent.style.opacity = '1';
    if (heroAside) heroAside.style.transform = 'none';
    if (heroBadges) {
      heroBadges.style.transform = 'none';
      heroBadges.style.opacity = '1';
    }
    return;
  }

  heroContent.style.transform = `translate3d(0, ${progress * 20}px, 0)`;
  heroContent.style.opacity = String(1 - progress * 0.18);

  if (heroAside) heroAside.style.transform = `translate3d(0, ${progress * -14}px, 0)`;
  if (heroBadges) {
    heroBadges.style.transform = `translate3d(${progress * -18}px, ${progress * 10}px, 0)`;
    heroBadges.style.opacity = String(1 - progress * 0.34);
  }
}

function updateHeroEffects(y) {
  if (isEditorialHome()) return;

  const heroSection = document.getElementById('hero');
  const heroContent = document.querySelector('.hero-content');
  const heroBadges = document.querySelector('.floating-badges');

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
  }
}

function updateShowcase(y) {
  if (document.body.classList.contains('home-editorial')) return;

  const showcaseScroll = document.getElementById('showcase-scroll');
  const showcaseStage = document.getElementById('showcase-stage');
  const showcaseFrames = Array.from(document.querySelectorAll('.showcase-frame'));

  if (showcaseScroll && showcaseStage && showcaseFrames.length) {
    const rect = showcaseScroll.getBoundingClientRect();
    const range = Math.max(rect.height - window.innerHeight, 1);
    const showcaseProgress = clamp(-rect.top / range, 0, 1);

    showcaseStage.style.setProperty('--showcase-progress', showcaseProgress.toFixed(3));
    updateShowcaseSequence(showcaseProgress, showcaseFrames);
  }
}

function updateShowcaseSequence(progress, showcaseFrames) {
  if (!showcaseFrames.length) return;
  const showcaseSteps = Array.from(document.querySelectorAll('#showcase-steps .showcase-step'));
  const showcaseProgressBar = document.getElementById('showcase-progress-bar');
  const showcaseCaption = document.getElementById('showcase-caption');

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
}
