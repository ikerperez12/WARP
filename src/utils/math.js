export function clamp01(value) {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function damp(current, target, lambda, delta) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}
