import * as THREE from 'three';

const MODE_CONFIG = {
  vehicle: {
    offset: new THREE.Vector3(7.2, 5.2, -11.8),
    lookYOffset: 1.4,
    damping: 0.082,
    headingDamping: 0.09,
    lateralBias: 0.52,
    distanceScale: 0.26,
    heightScale: 0.05,
    leadScale: 0.3,
    fov: [50, 58],
    shoulderBias: 2.2,
  },
  foot: {
    offset: new THREE.Vector3(4.8, 4.4, -7.6),
    lookYOffset: 1.6,
    damping: 0.11,
    headingDamping: 0.135,
    lateralBias: 0.28,
    distanceScale: 0.12,
    heightScale: 0.04,
    leadScale: 0.16,
    fov: [50, 56],
    shoulderBias: 1.0,
  },
  cinematic: {
    offset: new THREE.Vector3(9.5, 10.5, -19.0),
    lookYOffset: 2.4,
    damping: 0.058,
    headingDamping: 0.048,
    lateralBias: 0.46,
    distanceScale: 0.24,
    heightScale: 0.07,
    leadScale: 0.22,
    fov: [44, 50],
    shoulderBias: 2.4,
  },
};

function cloneConfig(config) {
  return {
    ...config,
    offset: config.offset.clone(),
    fov: [...(config.fov ?? [46, 52])],
  };
}

export function interpolateCameraConfig(fromConfig, toConfig, alpha = 1) {
  const from = fromConfig ?? MODE_CONFIG.vehicle;
  const to = toConfig ?? from;
  const t = THREE.MathUtils.clamp(alpha, 0, 1);

  return {
    offset: from.offset.clone().lerp(to.offset, t),
    lookYOffset: THREE.MathUtils.lerp(from.lookYOffset, to.lookYOffset, t),
    damping: THREE.MathUtils.lerp(from.damping, to.damping, t),
    headingDamping: THREE.MathUtils.lerp(from.headingDamping, to.headingDamping, t),
    lateralBias: THREE.MathUtils.lerp(from.lateralBias, to.lateralBias, t),
    distanceScale: THREE.MathUtils.lerp(from.distanceScale, to.distanceScale, t),
    heightScale: THREE.MathUtils.lerp(from.heightScale, to.heightScale, t),
    leadScale: THREE.MathUtils.lerp(from.leadScale, to.leadScale, t),
    shoulderBias: THREE.MathUtils.lerp(from.shoulderBias, to.shoulderBias, t),
    fov: [
      THREE.MathUtils.lerp(from.fov?.[0] ?? 46, to.fov?.[0] ?? 46, t),
      THREE.MathUtils.lerp(from.fov?.[1] ?? 52, to.fov?.[1] ?? 52, t),
    ],
  };
}

export function shortestAngleDelta(from, to) {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

export function resolveHeadingTarget({
  currentHeading = 0,
  explicitHeading,
  previousTarget,
  nextTarget,
  minDistance = 0.025,
} = {}) {
  if (typeof explicitHeading === 'number' && Number.isFinite(explicitHeading)) {
    return explicitHeading;
  }

  if (!previousTarget || !nextTarget) {
    return currentHeading;
  }

  const dx = nextTarget.x - previousTarget.x;
  const dz = nextTarget.z - previousTarget.z;
  if (dx * dx + dz * dz < minDistance * minDistance) {
    return currentHeading;
  }

  return Math.atan2(dx, dz);
}

export function computeCameraOffset(config, motionLength = 0, heading = 0) {
  const dynamicMotion = Math.min(1, motionLength);
  const offset = config.offset.clone();
  offset.z *= 1 + dynamicMotion * (config.distanceScale ?? 0);
  offset.y *= 1 + dynamicMotion * (config.heightScale ?? 0);
  offset.x += Math.sin(heading) * Math.abs(offset.z) * (config.lateralBias ?? 0);
  return offset;
}

export function computeCameraFrame(config, motionLength = 0, headingDelta = 0) {
  const dynamicMotion = Math.min(1, motionLength);
  const turnAmount = Math.min(1, Math.abs(headingDelta) / 0.75);
  const [minFov, maxFov] = config.fov ?? [46, 52];

  return {
    fov: minFov + (maxFov - minFov) * dynamicMotion,
    lookAhead: dynamicMotion * (config.leadScale ?? 0),
    shoulderOffset: Math.sign(headingDelta || 1) * turnAmount * (config.shoulderBias ?? 0),
  };
}

export class CameraSystem {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 600);
    this.mode = 'vehicle';
    this.previousMode = 'vehicle';
    this.modeBlend = 1;
    this.targetPosition = new THREE.Vector3();
    this.lookAtTarget = new THREE.Vector3();
    this.smoothedLookAt = new THREE.Vector3();
    this.heading = Math.PI;
    this.headingTarget = Math.PI;
    this.fovTarget = this.camera.fov;
    this.lastFocusTarget = null;
    this.motion = new THREE.Vector3();
    this.velocityBias = new THREE.Vector3();
  }

  setMode(mode = 'vehicle') {
    const nextMode = MODE_CONFIG[mode] ? mode : 'vehicle';
    if (nextMode === this.mode) return;
    this.previousMode = this.mode;
    this.mode = nextMode;
    this.modeBlend = 0;
  }

  getActiveConfig() {
    const easedBlend = this.modeBlend * this.modeBlend * (3 - 2 * this.modeBlend);
    return interpolateCameraConfig(MODE_CONFIG[this.previousMode], MODE_CONFIG[this.mode], easedBlend);
  }

  focus(target, options = {}) {
    const config = this.getActiveConfig();
    const nextTarget = new THREE.Vector3(target.x, target.y ?? 0, target.z);
    const previousTarget = this.lastFocusTarget;
    this.headingTarget = resolveHeadingTarget({
      currentHeading: this.headingTarget,
      explicitHeading: options.heading,
      previousTarget,
      nextTarget,
    });

    if (previousTarget) {
      this.motion.copy(nextTarget).sub(previousTarget);
    } else {
      this.motion.set(0, 0, 0);
    }

    const motionLength = this.motion.length();
    const headingDelta = shortestAngleDelta(this.heading, this.headingTarget);
    const frame = computeCameraFrame(config, motionLength, headingDelta);
    const offset = (options.offset || computeCameraOffset(config, motionLength, this.heading)).clone();
    offset.x += frame.shoulderOffset;
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.heading);

    this.velocityBias.copy(this.motion);
    if (this.velocityBias.lengthSq() > 0.0001) {
      this.velocityBias.normalize().multiplyScalar(motionLength * Math.abs(offset.z) * frame.lookAhead);
    } else {
      this.velocityBias.set(0, 0, 0);
    }

    this.fovTarget = frame.fov;

    this.targetPosition.set(
      target.x + offset.x + this.velocityBias.x,
      target.y + offset.y,
      target.z + offset.z + this.velocityBias.z,
    );
    this.lookAtTarget.set(
      target.x + this.velocityBias.x * 0.5,
      target.y + (options.lookYOffset ?? config.lookYOffset),
      target.z + this.velocityBias.z * 0.5,
    );

    this.lastFocusTarget = nextTarget;
  }

  update(dt = 0.016) {
    this.modeBlend = Math.min(1, this.modeBlend + dt * 3.4);
    const config = this.getActiveConfig();
    const damping = 1 - Math.pow(1 - config.damping, dt * 60);
    const headingDamping = 1 - Math.pow(1 - (config.headingDamping ?? config.damping), dt * 60);
    this.heading += shortestAngleDelta(this.heading, this.headingTarget) * headingDamping;
    this.camera.position.lerp(this.targetPosition, damping);
    this.smoothedLookAt.lerp(this.lookAtTarget, damping * 0.92);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.fovTarget, damping * 0.72);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.smoothedLookAt);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
