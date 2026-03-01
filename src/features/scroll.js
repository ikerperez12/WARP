import { isReduced, reducedMotionMedia } from '../utils/motion.js';
import { clamp } from '../utils/math.js';

let scrollTicking = false;

export function initScroll() {
  initRevealAnimations();
  initHeroFade();
  initAnchorLinks();

  // Initial call
  onScroll();

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      onScroll();
      scrollTicking = false;
    });
  }, { passive: true });

  window.addEventListener('warp:motion-mode', onScroll);

  if (typeof reducedMotionMedia.addEventListener === 'function') reducedMotionMedia.addEventListener('change', onScroll);
  else if (typeof reducedMotionMedia.addListener === 'function') reducedMotionMedia.addListener(onScroll);
}

function onScroll() {
  const y = window.scrollY;
  updateNavbar(y);
  updateProgressBar(y);
  updateBackToTop(y);
  updateActiveSection(y);
  updateHeroEffects(y);
  updateShowcase(y);
}

function initRevealAnimations() {
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
      target.scrollIntoView({ behavior: isReduced() ? 'auto' : 'smooth' });
    });
  });
}

function updateNavbar(y) {
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.classList.toggle('scrolled', y > 50);
}

function updateProgressBar(y) {
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${h > 0 ? (y / h) * 100 : 0}%`;
  }
}

function updateBackToTop(y) {
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) backToTop.classList.toggle('visible', y > 520);
}

function updateActiveSection(y) {
  const sections = Array.from(document.querySelectorAll('.section'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const visualSections = new Set([
    'experience-hero',
    'experience-cta',
    'showcase',
    'motion-reel',
    'neo-lab',
    'anime-lab',
    'interaction-deck',
    'google-services-section',
    'flow-simulator',
    'topology-lab',
    'split-reveal',
    'elite-cases',
    'tech-playbook',
  ]);

  let current = '';
  sections.forEach((section) => {
    const top = section.offsetTop - 110;
    const height = section.offsetHeight;
    if (y >= top && y < top + height) current = section.id;
  });

  navLinks.forEach((link) => {
    const key = link.dataset.section || '';
    const active = (key === 'showcase' || key === 'experience-cta') ? visualSections.has(current) : key === current;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function updateHeroEffects(y) {
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
  const showcaseScroll = document.getElementById('showcase-scroll');
  const showcaseStage = document.getElementById('showcase-stage');
  const showcaseFrames = Array.from(document.querySelectorAll('.showcase-frame'));

  if (showcaseScroll && showcaseStage && showcaseFrames.length) {
    const rect = showcaseScroll.getBoundingClientRect();
    // Calculate progress based on scroll position relative to the element
    // rect.top is relative to viewport.
    // If we want consistent calculation with original code:
    // const range = Math.max(rect.height - window.innerHeight, 1);
    // const showcaseProgress = clamp(-rect.top / range, 0, 1);
    // But onScroll is called inside loop, checking live rect is fine.

    // Original code:
    // const rect = showcaseScroll.getBoundingClientRect();
    // const range = Math.max(rect.height - window.innerHeight, 1);
    // const showcaseProgress = clamp(-rect.top / range, 0, 1);

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
