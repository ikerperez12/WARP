const ENGINE_AUDIO = {
  maxSpeed: 34,
  baseRate: 0.72,
  maxRate: 1.34,
  idleVolume: 0.025,
  maxVolume: 0.2,
};

const ENGINE_LAYERS = [
  {
    id: 'idle',
    src: '/gaming-assets/audio/engine/idle.mp3',
    window: [0, 0, 0.14, 0.4],
    gain: 1,
    rate: [0.9, 1.02],
  },
  {
    id: 'low',
    src: '/gaming-assets/audio/engine/low_off.mp3',
    window: [0.04, 0.16, 0.38, 0.64],
    gain: 0.92,
    rate: [0.82, 1.05],
  },
  {
    id: 'med',
    src: '/gaming-assets/audio/engine/med_on.mp3',
    window: [0.28, 0.48, 0.68, 0.9],
    gain: 0.8,
    rate: [0.9, 1.12],
  },
  {
    id: 'high',
    src: '/gaming-assets/audio/engine/high_on.mp3',
    window: [0.6, 0.82, 1, 1],
    gain: 0.72,
    rate: [0.98, 1.22],
  },
];

const AMBIENT_PROFILES = {
  'boot-relay': {
    id: 'boot-relay',
    src: '/gaming-assets/audio/ambient/boot-hum.mp3',
    volume: { vehicle: 0.026, foot: 0.038 },
    rate: { vehicle: 0.88, foot: 0.82 },
  },
  'firewall-sector': {
    id: 'firewall-sector',
    src: '/gaming-assets/audio/ambient/firewall-drone.mp3',
    volume: { vehicle: 0.03, foot: 0.048 },
    rate: { vehicle: 0.74, foot: 0.68 },
  },
  'routing-array': {
    id: 'routing-array',
    src: '/gaming-assets/audio/ambient/routing-grid.mp3',
    volume: { vehicle: 0.028, foot: 0.042 },
    rate: { vehicle: 0.8, foot: 0.72 },
  },
  'inference-core': {
    id: 'inference-core',
    src: '/gaming-assets/audio/ambient/inference-core.mp3',
    volume: { vehicle: 0.026, foot: 0.044 },
    rate: { vehicle: 0.6, foot: 0.54 },
  },
  'core-chamber': {
    id: 'core-chamber',
    src: '/gaming-assets/audio/ambient/core-chamber.mp3',
    volume: { vehicle: 0.032, foot: 0.05 },
    rate: { vehicle: 0.52, foot: 0.47 },
  },
};

const DEFAULT_SECTOR = 'boot-relay';

const CUE_LIBRARY = {
  start: {
    sources: ['/gaming-assets/audio/engine/startup.mp3'],
    volume: [0.2, 0.3],
    rate: [0.94, 1.04],
    cooldownMs: 220,
  },
  collect: {
    sources: [
      '/gaming-assets/audio/ui/reveal-1.mp3',
      '/gaming-assets/audio/ui/brick-2.mp3',
      '/gaming-assets/audio/ui/brick-6.mp3',
    ],
    volume: [0.12, 0.2],
    rate: [0.96, 1.08],
    cooldownMs: 70,
  },
  warn: {
    sources: [
      '/gaming-assets/audio/ui/screech-1.mp3',
      '/gaming-assets/audio/ui/wood-hit-1.mp3',
      '/gaming-assets/audio/ui/brick-1.mp3',
    ],
    volume: [0.14, 0.24],
    rate: [0.92, 1.08],
    cooldownMs: 140,
  },
  success: {
    sources: [
      '/gaming-assets/audio/ui/reveal-1.mp3',
      '/gaming-assets/audio/ui/area-1.mp3',
      '/gaming-assets/audio/ui/brick-7.mp3',
      '/gaming-assets/audio/ui/horn-2.mp3',
    ],
    volume: [0.16, 0.26],
    rate: [0.98, 1.06],
    cooldownMs: 180,
  },
  fail: {
    sources: [
      '/gaming-assets/audio/impacts/car-hit-1.mp3',
      '/gaming-assets/audio/impacts/car-hit-2.mp3',
      '/gaming-assets/audio/impacts/car-hit-3.mp3',
      '/gaming-assets/audio/impacts/car-hit-4.mp3',
      '/gaming-assets/audio/ui/screech-1.mp3',
    ],
    volume: [0.18, 0.28],
    rate: [0.86, 1],
    cooldownMs: 180,
  },
  switch: {
    sources: [
      '/gaming-assets/audio/ui/wood-hit-1.mp3',
      '/gaming-assets/audio/ui/area-1.mp3',
      '/gaming-assets/audio/ui/brick-8.mp3',
      '/gaming-assets/audio/ui/horn-1.mp3',
    ],
    volume: [0.12, 0.18],
    rate: [0.94, 1.08],
    cooldownMs: 110,
  },
  area: {
    sources: [
      '/gaming-assets/audio/ui/area-1.mp3',
      '/gaming-assets/audio/ui/car-horn-1.mp3',
    ],
    volume: [0.12, 0.18],
    rate: [0.96, 1.02],
    cooldownMs: 320,
  },
  mode: {
    sources: [
      '/gaming-assets/audio/ui/horn-1.mp3',
      '/gaming-assets/audio/ui/horn-3.mp3',
      '/gaming-assets/audio/ui/brick-2.mp3',
    ],
    volume: [0.1, 0.16],
    rate: [0.9, 1.08],
    cooldownMs: 180,
  },
  victory: {
    sources: [
      '/gaming-assets/audio/ui/car-horn-2.mp3',
      '/gaming-assets/audio/ui/reveal-1.mp3',
      '/gaming-assets/audio/ui/area-1.mp3',
    ],
    volume: [0.18, 0.28],
    rate: [0.94, 1.02],
    cooldownMs: 300,
  },
};

function lerp(current, target, t) {
  return current + (target - current) * t;
}

function safePlay(media) {
  if (!media?.play) return;
  const promise = media.play();
  promise?.catch?.(() => {});
}

function safePause(media) {
  media?.pause?.();
}

function isDocumentHidden() {
  return typeof document !== 'undefined' && Boolean(document.hidden);
}

function createLoopAudio(src, initialRate) {
  const loop = new Audio(src);
  loop.loop = true;
  loop.preload = 'auto';
  loop.volume = 0;
  loop.playbackRate = initialRate;
  return loop;
}

function createLayerStateMap() {
  return new Map(
    ENGINE_LAYERS.map((layer) => [
      layer.id,
      {
        currentVolume: 0,
        currentRate: layer.rate[0],
      },
    ]),
  );
}

function createAmbientStateMap() {
  return new Map(
    Object.values(AMBIENT_PROFILES).map((profile) => [
      profile.id,
      {
        currentVolume: 0,
        currentRate: profile.rate.vehicle,
      },
    ]),
  );
}

function computeWindowWeight(value, window) {
  const [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd] = window;
  if (value <= fadeInStart || value >= fadeOutEnd) return 0;
  if (value < fadeInEnd) {
    const span = Math.max(0.0001, fadeInEnd - fadeInStart);
    return clampAudioUnit((value - fadeInStart) / span);
  }
  if (value <= fadeOutStart) return 1;
  const span = Math.max(0.0001, fadeOutEnd - fadeOutStart);
  return 1 - clampAudioUnit((value - fadeOutStart) / span);
}

export function clampAudioUnit(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export function pickAudioVariant(variants, random = Math.random) {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const index = Math.min(variants.length - 1, Math.floor(clampAudioUnit(random(), 0, 0.999999) * variants.length));
  return variants[index];
}

export function resolveAmbientProfile(sectorId = DEFAULT_SECTOR) {
  return AMBIENT_PROFILES[sectorId] || AMBIENT_PROFILES[DEFAULT_SECTOR];
}

export function computeEngineLayers(normalizedSpeed = 0, active = false, masterTargetVolume = ENGINE_AUDIO.maxVolume) {
  return ENGINE_LAYERS.map((layer) => {
    const layerWeight = active ? computeWindowWeight(normalizedSpeed, layer.window) : 0;
    return {
      id: layer.id,
      targetVolume: clampAudioUnit(masterTargetVolume * layer.gain * layerWeight, 0, 1),
      targetRate: layer.rate[0] + (layer.rate[1] - layer.rate[0]) * normalizedSpeed,
    };
  });
}

export function computeEngineMix({
  speed = 0,
  mode = 'vehicle',
  started = false,
  paused = false,
  hidden = false,
} = {}) {
  const normalizedSpeed = clampAudioUnit(speed / ENGINE_AUDIO.maxSpeed);
  const active = Boolean(started && !paused && !hidden && mode === 'vehicle');
  const targetRate = ENGINE_AUDIO.baseRate + (ENGINE_AUDIO.maxRate - ENGINE_AUDIO.baseRate) * normalizedSpeed;
  const targetVolume = active
    ? ENGINE_AUDIO.idleVolume + (ENGINE_AUDIO.maxVolume - ENGINE_AUDIO.idleVolume) * normalizedSpeed
    : 0;

  return {
    active,
    normalizedSpeed,
    targetRate,
    targetVolume,
    layers: computeEngineLayers(normalizedSpeed, active, targetVolume),
  };
}

export function computeAmbientMix({
  sector = DEFAULT_SECTOR,
  mode = 'vehicle',
  started = false,
  paused = false,
  hidden = false,
} = {}) {
  const profile = resolveAmbientProfile(sector);
  const active = Boolean(started && !paused && !hidden);
  const modeKey = mode === 'foot' ? 'foot' : 'vehicle';

  return {
    active,
    sector: profile.id,
    targetVolume: active ? profile.volume[modeKey] : 0,
    targetRate: profile.rate[modeKey],
  };
}

export class AudioSystem {
  constructor() {
    this.enabled = typeof Audio !== 'undefined';
    this.masterVolume = 0.82;
    this.unlocked = false;
    this.engineLoops = new Map();
    this.ambientLoops = new Map();
    this.engineState = {
      speed: 0,
      mode: 'vehicle',
      started: false,
      paused: false,
      hidden: isDocumentHidden(),
      sector: DEFAULT_SECTOR,
    };
    this.engineMix = {
      lastTick: 0,
      layers: createLayerStateMap(),
      ambience: createAmbientStateMap(),
    };
    this.lastCueAt = new Map();
    this.raf = 0;
    this.tick = this.tick.bind(this);
    this.handleHudUpdate = this.handleHudUpdate.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.bindEvents();
  }

  bindEvents() {
    if (typeof window === 'undefined') return;

    window.addEventListener('game:update-hud', this.handleHudUpdate);
    window.addEventListener('game:pause', () => this.setEngineState({ paused: true }));
    window.addEventListener('game:resume', () => this.setEngineState({ started: true, paused: false }));
    window.addEventListener('game:over', () => this.setEngineState({ speed: 0, started: false, paused: true }));
    window.addEventListener('game:victory', () => {
      this.setEngineState({ speed: 0, started: false, paused: true });
      if (this.unlocked) this.playCue('victory');
    });
    window.addEventListener('game:sector-enter', (event) => {
      const sectorId = event?.detail?.sectorId || DEFAULT_SECTOR;
      this.setEngineState({ sector: sectorId });
      if (this.unlocked) this.playCue('area');
    });
    window.addEventListener('game:mode-change', (event) => {
      const mode = event?.detail?.mode;
      if (!mode) return;
      this.setEngineState({ mode });
      if (this.unlocked) this.playCue('mode');
    });
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  ensureLoops() {
    if (!this.enabled) return { engine: this.engineLoops, ambient: this.ambientLoops };

    if (this.engineLoops.size === 0) {
      ENGINE_LAYERS.forEach((layer) => {
        this.engineLoops.set(layer.id, createLoopAudio(layer.src, layer.rate[0]));
      });
    }

    if (this.ambientLoops.size === 0) {
      Object.values(AMBIENT_PROFILES).forEach((profile) => {
        this.ambientLoops.set(profile.id, createLoopAudio(profile.src, profile.rate.vehicle));
      });
    }

    return { engine: this.engineLoops, ambient: this.ambientLoops };
  }

  syncLoopPlayback(shouldPlay) {
    this.ensureLoops();
    this.engineLoops.forEach((loop) => {
      if (shouldPlay) {
        safePlay(loop);
        return;
      }
      safePause(loop);
    });
    this.ambientLoops.forEach((loop) => {
      if (shouldPlay) {
        safePlay(loop);
        return;
      }
      safePause(loop);
    });
  }

  ensureTicker() {
    if (!this.unlocked || this.raf || typeof requestAnimationFrame !== 'function') return;
    this.raf = requestAnimationFrame(this.tick);
  }

  handleHudUpdate(event) {
    const detail = event?.detail || {};
    this.setEngineState({
      speed: Number(detail.speed || 0),
      mode: detail.mode || this.engineState.mode,
      sector: detail.sectorId || this.engineState.sector,
      started: true,
      paused: false,
    });
  }

  handleVisibilityChange() {
    const hidden = isDocumentHidden();
    this.setEngineState({ hidden });
    this.syncLoopPlayback(this.unlocked && !hidden);
  }

  setEngineState(nextState = {}) {
    this.engineState = {
      ...this.engineState,
      ...nextState,
    };
    this.ensureTicker();
  }

  resume() {
    if (!this.enabled) return;
    this.unlocked = true;
    this.ensureLoops();
    this.syncLoopPlayback(!isDocumentHidden());
    this.ensureTicker();
  }

  tick(timestamp = 0) {
    this.raf = 0;
    const delta = Math.min(
      0.08,
      Math.max(0.016, this.engineMix.lastTick ? (timestamp - this.engineMix.lastTick) / 1000 : 0.016),
    );
    this.engineMix.lastTick = timestamp;

    const mix = computeEngineMix(this.engineState);
    const ambience = computeAmbientMix(this.engineState);
    const chase = 1 - Math.exp(-delta * 9);
    const ambienceChase = 1 - Math.exp(-delta * 5.5);

    mix.layers.forEach((layer) => {
      const loop = this.engineLoops.get(layer.id);
      const layerState = this.engineMix.layers.get(layer.id);
      if (!loop || !layerState) return;

      layerState.currentVolume = lerp(layerState.currentVolume, layer.targetVolume, chase);
      layerState.currentRate = lerp(layerState.currentRate, layer.targetRate, chase * 0.8);
      loop.volume = clampAudioUnit(layerState.currentVolume * this.masterVolume, 0, 1);
      loop.playbackRate = clampAudioUnit(layerState.currentRate, 0.25, 4);

      if (this.unlocked && !isDocumentHidden() && loop.paused) {
        safePlay(loop);
      }
    });

    this.ambientLoops.forEach((loop, id) => {
      const layerState = this.engineMix.ambience.get(id);
      if (!loop || !layerState) return;

      const targetVolume = ambience.active && ambience.sector === id ? ambience.targetVolume : 0;
      const targetRate = ambience.sector === id ? ambience.targetRate : resolveAmbientProfile(id).rate.vehicle;
      layerState.currentVolume = lerp(layerState.currentVolume, targetVolume, ambienceChase);
      layerState.currentRate = lerp(layerState.currentRate, targetRate, ambienceChase * 0.75);
      loop.volume = clampAudioUnit(layerState.currentVolume * this.masterVolume, 0, 0.22);
      loop.playbackRate = clampAudioUnit(layerState.currentRate, 0.3, 1.4);

      if (this.unlocked && !isDocumentHidden() && loop.paused) {
        safePlay(loop);
      }
    });

    if (this.unlocked) this.ensureTicker();
  }

  playCue(type = 'collect') {
    if (!this.enabled) return;
    const cue = CUE_LIBRARY[type] || CUE_LIBRARY.collect;
    const now = Date.now();
    const lastPlay = this.lastCueAt.get(type) || 0;
    if (now - lastPlay < cue.cooldownMs) return;
    this.lastCueAt.set(type, now);

    if (type === 'start') {
      this.setEngineState({ started: true, paused: false });
      this.resume();
    }

    const src = pickAudioVariant(cue.sources);
    if (!src) return;

    const sample = new Audio(src);
    sample.preload = 'auto';
    sample.volume = clampAudioUnit(
      (cue.volume[0] + Math.random() * (cue.volume[1] - cue.volume[0])) * this.masterVolume,
      0,
      1,
    );
    sample.playbackRate = cue.rate[0] + Math.random() * (cue.rate[1] - cue.rate[0]);
    safePlay(sample);
  }
}
