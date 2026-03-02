import { SECTORS } from './sectors.js';

export function pointInCircle(point, zone) {
  const dx = point.x - zone.center.x;
  const dz = point.z - zone.center.z;
  return dx * dx + dz * dz <= zone.radius * zone.radius;
}

export function findSectorForPoint(point, sectors = SECTORS) {
  return sectors.find((sector) => pointInCircle(point, sector)) || sectors[0];
}

export function distance2D(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

export function findNearestInteractable(point, interactables, radius = 8) {
  let best = null;
  for (const item of interactables) {
    if (!item.active) continue;
    const dist = distance2D(point, item.position);
    if (dist <= radius && (!best || dist < best.distance)) {
      best = { item, distance: dist };
    }
  }
  return best;
}
