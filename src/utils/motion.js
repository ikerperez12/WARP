export const MOTION = {
  easePrimary: 'easeOutCubic',
  easeSoft: 'easeOutQuad',
  easeInOut: 'easeInOutSine',
  durationFast: 320,
  durationBase: 520,
  durationSlow: 920,
};

export const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

export const isReduced = () => {
  return reducedMotionMedia.matches || document.body.dataset.motion === 'reduced';
};

export const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
