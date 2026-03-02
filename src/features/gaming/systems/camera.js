import * as THREE from 'three';

const MODE_CONFIG = {
  vehicle: { offset: new THREE.Vector3(0, 34, 27), lookYOffset: 3.5, damping: 0.12 },
  foot: { offset: new THREE.Vector3(0, 24, 16), lookYOffset: 2.5, damping: 0.16 },
  cinematic: { offset: new THREE.Vector3(0, 48, 38), lookYOffset: 4, damping: 0.08 },
};

export class CameraSystem {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 600);
    this.mode = 'vehicle';
    this.targetPosition = new THREE.Vector3();
    this.lookAtTarget = new THREE.Vector3();
  }

  setMode(mode = 'vehicle') {
    this.mode = MODE_CONFIG[mode] ? mode : 'vehicle';
  }

  focus(target, options = {}) {
    const config = MODE_CONFIG[this.mode];
    const offset = options.offset || config.offset;
    this.targetPosition.set(target.x + offset.x, target.y + offset.y, target.z + offset.z);
    this.lookAtTarget.set(target.x, target.y + (options.lookYOffset ?? config.lookYOffset), target.z);
  }

  update(dt = 0.016) {
    const config = MODE_CONFIG[this.mode];
    const damping = 1 - Math.pow(1 - config.damping, dt * 60);
    this.camera.position.lerp(this.targetPosition, damping);
    const nextLook = new THREE.Vector3().copy(this.lookAtTarget);
    this.camera.lookAt(nextLook);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
