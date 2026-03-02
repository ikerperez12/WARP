import { WORLD_EXTENTS } from '../config.js';

export function clampToWorld(point) {
  return {
    x: Math.max(WORLD_EXTENTS.minX, Math.min(WORLD_EXTENTS.maxX, point.x)),
    z: Math.max(WORLD_EXTENTS.minZ, Math.min(WORLD_EXTENTS.maxZ, point.z)),
  };
}

export function isWithinRadius(point, target, radius) {
  const dx = point.x - target.x;
  const dz = point.z - target.z;
  return dx * dx + dz * dz <= radius * radius;
}

export function normalizeInput(moveX, moveY) {
  const length = Math.sqrt(moveX * moveX + moveY * moveY) || 1;
  return {
    x: moveX / length,
    y: moveY / length,
  };
}
