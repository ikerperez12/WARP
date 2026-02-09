import anime from 'animejs/lib/anime.es.js';
import { initThreeScene } from './three-scene.js';

// ========================================
// Initialize Three.js Scene
// ========================================
initThreeScene();

// ========================================
// Wait for DOM
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  // ========================================
  // Hero entrance animations
  // ========================================
  const heroElements = document.querySelectorAll('.hero-section .anim-fade-up');
  heroElements.forEach(el => el.classList.add('animated'));

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

  // ========================================
  // Stat Counter Animation
  // ========================================
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    statNumbers.forEach(stat => {
      const target = parseInt(stat.dataset.target, 10);
      anime({
        targets: stat,
        innerHTML: [0, target],
        round: 1,
        easing: 'easeOutExpo',
        duration: 2000,
        delay: 500,
      });
    });
  }

  // Animate stats immediately since hero is visible
  setTimeout(animateStats, 800);

  // ========================================
  // Scroll Observer for Reveal Animations
  // ========================================
  const revealElements = document.querySelectorAll('.anim-reveal');

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

  revealElements.forEach(el => revealObserver.observe(el));

  // ========================================
  // Skill Bars Animation
  // ========================================
  const skillBars = document.querySelectorAll('.skill-bar-fill');

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

  skillBars.forEach(bar => skillObserver.observe(bar));

  // ========================================
  // Stagger animations on skill tags
  // ========================================
  const skillCategories = document.querySelectorAll('.skill-category');

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

  skillCategories.forEach(cat => tagObserver.observe(cat));

  // ========================================
  // Project Card Hover Animations
  // ========================================
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
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

    // Hero transitional fade on left text block
    if (heroSection && heroContent) {
      const heroStart = heroSection.offsetTop;
      const heroRange = Math.max(heroSection.offsetHeight - window.innerHeight * 0.2, window.innerHeight * 0.9);
      const heroProgress = Math.max(0, Math.min(1, (window.scrollY - heroStart) / heroRange));

      const fadeStart = 0.18;
      const fadeEnd = 0.62;
      const fadeT = Math.max(0, Math.min(1, (heroProgress - fadeStart) / (fadeEnd - fadeStart)));

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
  }, { passive: true });

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
      anime({
        targets: '.mobile-link',
        translateX: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(80, { start: 200 }),
        easing: 'easeOutExpo',
        duration: 600,
      });
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
        target.scrollIntoView({ behavior: 'smooth' });
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

      anime({
        targets: btn,
        scale: [1, 1.05, 1],
        duration: 600,
        easing: 'easeOutElastic(1, .5)',
      });

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
    const content = item.querySelector('.timeline-content');

    item.addEventListener('mouseenter', () => {
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

  highlights.forEach(h => highlightObserver.observe(h));

  // ========================================
  // Code window typing animation
  // ========================================
  const codeWindow = document.querySelector('.code-content');
  if (codeWindow) {
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
    codeObserver.observe(codeWindow);
  }

  // ========================================
  // Contact cards stagger
  // ========================================
  const contactCards = document.querySelectorAll('.contact-card');
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

  if (contactCards.length > 0) {
    contactObserver.observe(contactCards[0]);
  }
});
