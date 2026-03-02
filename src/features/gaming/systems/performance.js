import { QUALITY_PRESETS } from '../config.js';

export function selectAutoQuality({ width = 1440, height = 900, dpr = 1, touch = false, fps = 60 } = {}) {
  const pixels = width * height * dpr;
  if (touch || fps < 42 || pixels > 3200000) return 'low';
  if (fps < 52 || pixels > 2200000) return 'medium';
  if (fps > 70 && pixels < 1900000) return 'high';
  return 'auto';
}

export class PerformanceManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.quality = 'auto';
  }

  setQuality(name) {
    this.quality = QUALITY_PRESETS[name] ? name : 'auto';
    const preset = QUALITY_PRESETS[this.quality];
    if (!this.renderer) return preset;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, preset.pixelRatio));
    this.renderer.shadowMap.enabled = preset.shadows;
    return preset;
  }

  autoDetect() {
    return selectAutoQuality({
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
      touch: Boolean(window.matchMedia?.('(pointer: coarse)')?.matches),
      fps: 60,
    });
  }
}
