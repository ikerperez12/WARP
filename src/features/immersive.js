import { clamp } from '../utils/math.js';
import { isReduced } from '../utils/motion.js';
import anime from 'animejs/lib/anime.es.js';

export function initImmersiveSections() {
  initScrollReel();
  initNeumorphismLab();
  initAnimeMotionLab();
}

function initScrollReel() {
  const reelRoot = document.getElementById('reel-experience');
  const reelViewport = document.getElementById('reel-viewport');
  const reelTrack = document.getElementById('reel-track');
  const frames = Array.from(document.querySelectorAll('.reel-frame'));
  const progressBar = document.getElementById('reel-progress-bar');
  const caption = document.getElementById('reel-caption');

  if (!reelRoot || !reelViewport || !reelTrack || !frames.length) return;

  let ticking = false;
  const frameCount = frames.length;
  const maxFrameIndex = Math.max(frameCount - 1, 1);

  const update = () => {
    ticking = false;
    const rect = reelRoot.getBoundingClientRect();
    const range = Math.max(rect.height - window.innerHeight, 1);
    const progress = clamp(-rect.top / range, 0, 1);

    const viewportWidth = reelViewport.clientWidth;
    const trackWidth = reelTrack.scrollWidth;
    const maxTravel = Math.max(trackWidth - viewportWidth, 0);
    const travel = maxTravel * progress;

    reelViewport.style.setProperty('--reel-progress', progress.toFixed(3));
    reelTrack.style.transform = `translate3d(${-travel}px, 0, 0)`;

    const floatIndex = progress * maxFrameIndex;
    const activeIndex = Math.round(floatIndex);

    frames.forEach((frame, index) => {
      const distance = Math.abs(index - floatIndex);
      const scale = 1 - Math.min(0.12, distance * 0.024);
      const lift = Math.max(0, 26 - distance * 11);
      frame.style.setProperty('--reel-scale', scale.toFixed(3));
      frame.style.setProperty('--reel-lift', `${lift.toFixed(2)}px`);
      frame.classList.toggle('is-active', index === activeIndex);
    });

    if (progressBar) progressBar.style.width = `${(progress * 100).toFixed(1)}%`;
    if (caption) caption.textContent = document.documentElement.lang === 'en'
      ? `Frame ${Math.min(frameCount, activeIndex + 1)} / ${frameCount}`
      : `Frame ${Math.min(frameCount, activeIndex + 1)} / ${frameCount}`;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('warp:motion-mode', onScroll);
  window.addEventListener('warp:lang-changed', onScroll);
}

function initNeumorphismLab() {
  const neoLayout = document.getElementById('neo-layout');
  const neoConsole = document.getElementById('neo-console');
  const neoPreviewCard = document.getElementById('neo-preview-card');
  const switches = Array.from(document.querySelectorAll('.neo-switch'));
  const slider = document.getElementById('neo-intensity');
  const depthValue = document.getElementById('neo-depth-value');
  const profileValue = document.getElementById('neo-profile-value');

  if (!neoLayout || !neoConsole || !switches.length || !slider || !depthValue || !profileValue) return;

  const profileNames = {
    es: { focus: 'Calidad', cinematic: 'Presentaci�n', delivery: 'Entrega' },
    en: { focus: 'Quality', cinematic: 'Presentation', delivery: 'Delivery' },
  };

  const updateDepth = () => {
    const value = Number(slider.value || 62);
    neoLayout.style.setProperty('--neo-depth', `${value}`);
    depthValue.textContent = `${value}%`;
  };

  updateDepth();
  slider.addEventListener('input', updateDepth);

  const setProfile = (button) => {
    switches.forEach((entry) => entry.classList.toggle('is-active', entry === button));
    const key = button.dataset.neoProfile || 'focus';
    const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
    profileValue.textContent = profileNames[lang][key] || profileNames[lang].focus;
    neoLayout.setAttribute('data-neo-profile', key);

    if (!neoPreviewCard || isReduced()) return;
    anime.remove(neoPreviewCard);
    anime({
      targets: neoPreviewCard,
      scale: [0.985, 1],
      translateY: [8, 0],
      duration: 460,
      easing: 'easeOutExpo',
    });
  };

  switches.forEach((button) => {
    button.addEventListener('click', () => setProfile(button));
  });

  const resetLight = () => {
    neoLayout.style.setProperty('--neo-light-x', '50%');
    neoLayout.style.setProperty('--neo-light-y', '50%');
  };

  neoConsole.addEventListener('pointermove', (event) => {
    const rect = neoConsole.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    neoLayout.style.setProperty('--neo-light-x', `${x.toFixed(1)}%`);
    neoLayout.style.setProperty('--neo-light-y', `${y.toFixed(1)}%`);
  });

  neoConsole.addEventListener('pointerleave', resetLight);
  window.addEventListener('warp:lang-changed', () => {
    const active = switches.find((entry) => entry.classList.contains('is-active')) || switches[0];
    setProfile(active);
  });
}

function initAnimeMotionLab() {
  const grid = document.getElementById('anime-grid');
  const tiles = Array.from(document.querySelectorAll('[data-anime-tile]'));
  const replayButton = document.getElementById('anime-replay-btn');
  const phaseLabel = document.getElementById('anime-phase');

  if (!grid || !tiles.length || !replayButton || !phaseLabel) return;

  const setPhase = (key) => {
    const isEn = document.documentElement.lang === 'en';
    const map = {
      idle: isEn ? 'Flow idle' : 'Flujo en espera',
      running: isEn ? 'Flow running' : 'Flujo en ejecuci�n',
      reduced: isEn ? 'Reduced motion active' : 'Motion reducido activo',
      done: isEn ? 'Flow complete' : 'Flujo completado',
    };
    phaseLabel.textContent = map[key];
  };

  const playSequence = () => {
    setPhase('running');
    if (isReduced()) {
      setPhase('reduced');
      tiles.forEach((tile) => {
        tile.style.opacity = '1';
        tile.style.transform = 'none';
      });
      return;
    }

    anime.remove(tiles);
    anime({
      targets: tiles,
      opacity: [0, 1],
      translateY: [34, 0],
      scale: [0.96, 1],
      rotateX: [7, 0],
      delay: anime.stagger(110),
      duration: 720,
      easing: 'easeOutExpo',
      complete: () => setPhase('done'),
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      playSequence();
      observer.disconnect();
    });
  }, { threshold: 0.28 });
  observer.observe(grid);

  replayButton.addEventListener('click', playSequence);
  window.addEventListener('warp:lang-changed', () => {
    replayButton.textContent = document.documentElement.lang === 'en' ? 'Replay flow' : 'Reproducir flujo';
    setPhase('idle');
  });
}
