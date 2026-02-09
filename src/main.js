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

  function isMotionReduced() {
    return document.body.dataset.motion === 'reduced' || reducedMotionMedia.matches;
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
    });

    uiPanel.querySelectorAll('.ui-option').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'toggle-grain') {
          visualPrefs.grain = visualPrefs.grain === 'on' ? 'off' : 'on';
        } else if (action === 'toggle-cursor') {
          visualPrefs.cursor = visualPrefs.cursor === 'on' ? 'off' : 'on';
        } else if (action === 'toggle-motion') {
          visualPrefs.motion = visualPrefs.motion === 'full' ? 'reduced' : 'full';
        }
        commitVisualPrefs();
      });
    });

    document.addEventListener('click', (event) => {
      if (!uiPanel.classList.contains('open')) return;
      if (uiPanel.contains(event.target) || uiToggle.contains(event.target)) return;
      uiPanel.classList.remove('open');
      uiPanel.setAttribute('aria-hidden', 'true');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (!uiPanel.classList.contains('open')) return;
      uiPanel.classList.remove('open');
      uiPanel.setAttribute('aria-hidden', 'true');
    });
  }

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
        easing: 'easeOutExpo',
        duration: 2000,
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
            easing: 'easeOutExpo',
            duration: 1500,
            delay: 300,
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
            easing: 'easeOutExpo',
            duration: 600,
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
        translateY: [-5, 0],
        opacity: [0.5, 1],
        delay: anime.stagger(40),
        easing: 'easeOutExpo',
        duration: 400,
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
      if (link.dataset.section === currentSection) {
        link.classList.add('active');
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

      const fadeStart = 0.18;
      const fadeEnd = 0.62;
      const fadeT = Math.max(0, Math.min(1, (heroProgress - fadeStart) / (fadeEnd - fadeStart)));

      if (isMotionReduced()) {
        heroContent.style.opacity = String(1 - fadeT * 0.35);
        heroContent.style.transform = 'none';
        heroContent.style.filter = 'none';
        if (heroBadges) {
          heroBadges.style.opacity = String(1 - fadeT * 0.45);
          heroBadges.style.transform = 'none';
        }
        if (heroScrollIndicator) {
          heroScrollIndicator.style.opacity = String(1 - fadeT * 0.7);
          heroScrollIndicator.style.transform = 'none';
        }
      } else {
        const textOpacity = 1 - fadeT;
        const translateX = -40 * fadeT;
        const blurPx = 6 * fadeT;

        heroContent.style.opacity = String(textOpacity);
        heroContent.style.transform = `translate3d(${translateX}px, 0, 0)`;
        heroContent.style.filter = `blur(${blurPx}px)`;

        if (heroBadges) {
          heroBadges.style.opacity = String(1 - fadeT * 0.9);
          heroBadges.style.transform = `translate3d(${translateX * 0.6}px, 0, 0)`;
        }

        if (heroScrollIndicator) {
          heroScrollIndicator.style.opacity = String(1 - fadeT * 1.2);
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

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';

    if (mobileMenu.classList.contains('open')) {
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
          easing: 'easeOutExpo',
          duration: 600,
        });
      }
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
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
      btn.querySelector('span').textContent = '¡Mensaje enviado! ✓';

      if (!isMotionReduced()) {
        anime({
          targets: btn,
          scale: [1, 1.05, 1],
          duration: 600,
          easing: 'easeOutElastic(1, .5)',
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
        scale: [0.9, 1],
        opacity: [0.7, 1],
        delay: anime.stagger(30),
        easing: 'easeOutExpo',
        duration: 300,
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
            translateX: [30, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 800,
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
              translateY: [10, 0],
              easing: 'easeOutExpo',
              duration: 800,
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
            translateX: [-30, 0],
            opacity: [0, 1],
            delay: anime.stagger(100, { start: 200 }),
            easing: 'easeOutExpo',
            duration: 700,
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
