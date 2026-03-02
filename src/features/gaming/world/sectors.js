export const SECTORS = [
  {
    id: 'boot-relay',
    center: { x: 0, z: 0 },
    radius: 30,
    accent: '#3cf5d2',
    glow: '#8df7e1',
  },
  {
    id: 'firewall-sector',
    center: { x: -78, z: -12 },
    radius: 28,
    accent: '#ff5b57',
    glow: '#ff9f82',
  },
  {
    id: 'routing-array',
    center: { x: 82, z: -8 },
    radius: 28,
    accent: '#39a7ff',
    glow: '#85d5ff',
  },
  {
    id: 'inference-core',
    center: { x: 0, z: 88 },
    radius: 30,
    accent: '#b06cff',
    glow: '#d5acff',
  },
  {
    id: 'core-chamber',
    center: { x: 0, z: -92 },
    radius: 25,
    accent: '#ffd166',
    glow: '#ffe8ab',
  },
];

export const SECTOR_BY_ID = Object.fromEntries(SECTORS.map((sector) => [sector.id, sector]));
