export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function clamp01(value) {
  return clamp(value, 0, 1);
}

export function damp(current, target, lambda, delta) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}
