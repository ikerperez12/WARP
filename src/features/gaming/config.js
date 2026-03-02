export const GAME_SAVE_KEY = 'warp.gameProgress.v1';
export const GAME_SAVE_VERSION = 1;
export const WORLD_EXTENTS = { minX: -140, maxX: 140, minZ: -132, maxZ: 134 };
export const MINIMAP_SIZE = 180;
export const INTERACT_RANGE = 8;
export const HAZARD_DAMAGE_PER_SECOND = 18;
export const MAX_INTEGRITY = 100;
export const MAX_ENERGY = 100;

export const QUALITY_PRESETS = {
  auto: { pixelRatio: 1.25, shadows: true, bloom: 0.65, decor: 1, fog: 1 },
  high: { pixelRatio: 1.5, shadows: true, bloom: 0.8, decor: 1.2, fog: 1 },
  medium: { pixelRatio: 1.1, shadows: true, bloom: 0.55, decor: 0.8, fog: 0.8 },
  low: { pixelRatio: 0.85, shadows: false, bloom: 0.3, decor: 0.45, fog: 0.6 },
};

export const MISSION_ORDER = [
  'boot-sequence',
  'breach-firewall',
  'restore-routing',
  'stabilize-inference',
  'system-reboot',
];

export const SECTOR_ORDER = [
  'boot-relay',
  'firewall-sector',
  'routing-array',
  'inference-core',
  'core-chamber',
];

export const SECTOR_UNLOCKS = {
  'boot-sequence': ['boot-relay', 'firewall-sector'],
  'breach-firewall': ['routing-array'],
  'restore-routing': ['inference-core'],
  'stabilize-inference': ['core-chamber'],
  'system-reboot': [],
};

export const POINTER_ACTIONS = ['boost', 'interact', 'toggle', 'pause'];
