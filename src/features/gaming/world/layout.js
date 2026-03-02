export const WORLD_LAYOUT = {
  boot: {
    bootBeacon: { x: 0, y: 1.2, z: 9 },
    dock: { x: 11, y: 0, z: -1 },
  },
  firewall: {
    dock: { x: -58, y: 0, z: -4 },
    beacons: [
      { id: 'security-beacon-a', x: -90, y: 1.2, z: -26 },
      { id: 'security-beacon-b', x: -66, y: 1.2, z: 10 },
    ],
    shards: [
      { id: 'security-shard-a', x: -87, y: 1.2, z: -2 },
      { id: 'security-shard-b', x: -74, y: 1.2, z: 16 },
      { id: 'security-shard-c', x: -63, y: 1.2, z: -18 },
    ],
    nodes: [
      { id: 'security-node-a', x: -95, y: 1.2, z: 5, order: 1 },
      { id: 'security-node-b', x: -79, y: 1.2, z: 21, order: 2 },
      { id: 'security-node-c', x: -62, y: 1.2, z: -8, order: 3 },
    ],
    lasers: [
      { id: 'security-laser-a', anchor: { x: -88, z: -12 }, axis: 'z', range: 16, speed: 0.7 },
      { id: 'security-laser-b', anchor: { x: -74, z: 6 }, axis: 'x', range: 14, speed: 0.9 },
      { id: 'security-laser-c', anchor: { x: -66, z: -14 }, axis: 'z', range: 18, speed: 1.05 },
    ],
  },
  routing: {
    dock: { x: 58, y: 0, z: -2 },
    towers: [
      { id: 'routing-tower-a', x: 60, y: 1.2, z: -28 },
      { id: 'routing-tower-b', x: 91, y: 1.2, z: 8 },
      { id: 'routing-tower-c', x: 110, y: 1.2, z: -18 },
    ],
    switches: [
      { id: 'routing-switch-a', x: 72, y: 1.2, z: 16, target: 2 },
      { id: 'routing-switch-b', x: 86, y: 1.2, z: 16, target: 1 },
      { id: 'routing-switch-c', x: 100, y: 1.2, z: 16, target: 3 },
    ],
  },
  inference: {
    dock: { x: -10, y: 0, z: 62 },
    seeds: [
      { id: 'inference-seed-a', x: -22, y: 1.2, z: 94, key: 'alpha' },
      { id: 'inference-seed-b', x: -2, y: 1.2, z: 116, key: 'beta' },
      { id: 'inference-seed-c', x: 18, y: 1.2, z: 98, key: 'gamma' },
      { id: 'inference-seed-d', x: 10, y: 1.2, z: 72, key: 'delta' },
    ],
    terminals: [
      { id: 'inference-terminal-alpha', x: -14, y: 1.2, z: 86, key: 'alpha' },
      { id: 'inference-terminal-beta', x: -2, y: 1.2, z: 82, key: 'beta' },
      { id: 'inference-terminal-gamma', x: 10, y: 1.2, z: 86, key: 'gamma' },
      { id: 'inference-terminal-delta', x: -2, y: 1.2, z: 98, key: 'delta' },
    ],
  },
  core: {
    dock: { x: 0, y: 0, z: -68 },
    pylons: [
      { id: 'core-pylon-a', x: -14, y: 1.2, z: -97 },
      { id: 'core-pylon-b', x: 15, y: 1.2, z: -96 },
      { id: 'core-pylon-c', x: 0, y: 1.2, z: -116 },
    ],
    console: { id: 'core-console', x: 0, y: 1.2, z: -92 },
  },
};
