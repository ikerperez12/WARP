import * as THREE from 'three';
import { clampToWorld, normalizeInput } from '../systems/collision.js';
import { instantiateAsset, tintImportedModel } from '../world/assets.js';

function clampUnit(value) {
  return Math.max(0, Math.min(1, value));
}

export function computeAvatarFeedback({
  speed = 0,
  maxSpeed = 16.5,
  moveX = 0,
  velocityX = 0,
  velocityY = 0,
  stepTime = 0,
  dashing = false,
} = {}) {
  const normalizedSpeed = clampUnit(speed / Math.max(maxSpeed, 0.001));
  const swing = Math.sin(stepTime) * normalizedSpeed * 0.7;
  const dashPulse = dashing ? 1 : 0;

  return {
    normalizedSpeed,
    swing,
    bob: Math.sin(stepTime * (normalizedSpeed > 0.05 ? 1 : 0.4)) * normalizedSpeed * 0.22 + dashPulse * 0.03,
    leanZ: velocityX * 0.012 - moveX * (0.04 + normalizedSpeed * 0.08) - dashPulse * moveX * 0.05,
    leanX: -velocityY * 0.003 - normalizedSpeed * 0.04 - dashPulse * 0.03,
    shadowScale: 1 + normalizedSpeed * 0.16 + dashPulse * 0.05,
    shadowOpacity: 0.18 + normalizedSpeed * 0.12 + dashPulse * 0.03,
    haloOpacity: 0.08 + normalizedSpeed * 0.14 + dashPulse * 0.08,
    haloScale: 1 + normalizedSpeed * 0.28 + dashPulse * 0.12,
    dashGlow: 0.18 + normalizedSpeed * 0.32 + dashPulse * 0.54,
  };
}

export class AvatarEntity {
  constructor(materials, assets = null) {
    this.group = new THREE.Group();
    this.visualRoot = new THREE.Group();
    this.group.add(this.visualRoot);
    this.velocity = new THREE.Vector2();
    this.speed = 0;
    this.maxSpeed = 16.5;
    this.acceleration = 34;
    this.drag = 10;
    this.stepTime = 0;
    this.mixer = null;
    this.actions = {};
    this.activeAction = null;
    this.coreGlow = null;
    this.backpackGlow = null;

    this.shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 24),
      new THREE.MeshBasicMaterial({ color: '#04111f', transparent: true, opacity: 0.22 }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.05;
    this.group.add(this.shadow);

    this.halo = new THREE.Mesh(
      new THREE.RingGeometry(1.15, 1.45, 32),
      new THREE.MeshBasicMaterial({
        color: '#7be6ff',
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
      }),
    );
    this.halo.rotation.x = -Math.PI / 2;
    this.halo.position.y = 0.08;
    this.group.add(this.halo);

    if (assets?.robotExpressive) {
      const robot = instantiateAsset(assets.robotExpressive, {
        height: 6.2,
        tint: '#7fcfff',
        tintStrength: 0.14,
        emissiveBoost: 0.08,
      });
      robot.position.y = 0.02;
      robot.rotation.y = Math.PI;
      tintImportedModel(robot, '#6bdcff', 0.08, 0.04);
      this.visualRoot.add(robot);

      const backpackGlow = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1, 0.26),
        new THREE.MeshStandardMaterial({
          color: '#9ef1ff',
          emissive: '#54ddff',
          emissiveIntensity: 1.1,
          transparent: true,
          opacity: 0.9,
        }),
      );
      backpackGlow.position.set(0, 3.2, -0.68);
      this.backpackGlow = backpackGlow;
      this.visualRoot.add(backpackGlow);

      this.mixer = new THREE.AnimationMixer(robot);
      for (const clip of assets.robotExpressive.animations || []) {
        const action = this.mixer.clipAction(clip);
        action.enabled = true;
        this.actions[clip.name] = action;
      }

      this.setAction(this.actions.Idle || this.actions.Standing || Object.values(this.actions)[0] || null, true);
    } else {
      const torso = new THREE.Mesh(new THREE.BoxGeometry(2.1, 3.2, 1.2), materials.neutral);
      torso.position.y = 3.2;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12), materials.emissive('#9bc9ff', 0.9));
      head.position.y = 5.6;
      const legLeft = new THREE.Mesh(new THREE.BoxGeometry(0.54, 2.2, 0.54), materials.border);
      const legRight = legLeft.clone();
      legLeft.position.set(-0.45, 1.3, 0);
      legRight.position.set(0.45, 1.3, 0);
      const armLeft = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.1, 0.45), materials.border);
      const armRight = armLeft.clone();
      armLeft.position.set(-1.35, 3.5, 0);
      armRight.position.set(1.35, 3.5, 0);

      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.42, 0),
        materials.emissive('#67e0ff', 1.2),
      );
      core.position.set(0, 3.3, -0.86);
      this.coreGlow = core;

      this.animatedParts = { legLeft, legRight, armLeft, armRight, torso, head };
      this.visualRoot.add(torso, head, legLeft, legRight, armLeft, armRight, core);
    }

    this.group.userData.entity = 'avatar';
    this.group.position.set(0, 0, 0);
  }

  setAction(nextAction, immediate = false) {
    if (!nextAction || this.activeAction === nextAction) return;
    const previous = this.activeAction;
    this.activeAction = nextAction;
    if (previous) {
      previous.fadeOut(immediate ? 0 : 0.22);
    }
    nextAction.reset().fadeIn(immediate ? 0 : 0.22).play();
  }

  setVisible(value) {
    this.group.visible = value;
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  getPosition() {
    return this.group.position;
  }

  update(input, dt) {
    const moving = input.moveX !== 0 || input.moveY !== 0;
    if (moving) {
      const dir = normalizeInput(input.moveX, input.moveY);
      const dash = input.dash ? 1.15 : 1;
      this.velocity.x += dir.x * this.acceleration * dash * dt;
      this.velocity.y += -dir.y * this.acceleration * dash * dt;
      if (this.velocity.length() > this.maxSpeed * dash) this.velocity.setLength(this.maxSpeed * dash);
      this.group.rotation.y = Math.atan2(this.velocity.x, this.velocity.y);
      this.stepTime += dt * (8.6 + dash * 3.2);
    } else {
      this.velocity.multiplyScalar(Math.max(0, 1 - this.drag * dt));
      this.stepTime += dt * 3.2;
    }

    this.group.position.x += this.velocity.x * dt;
    this.group.position.z += this.velocity.y * dt;
    const clamped = clampToWorld(this.group.position);
    this.group.position.x = clamped.x;
    this.group.position.z = clamped.z;
    this.speed = this.velocity.length();

    const feedback = computeAvatarFeedback({
      speed: this.speed,
      maxSpeed: this.maxSpeed,
      moveX: input.moveX,
      velocityX: this.velocity.x,
      velocityY: this.velocity.y,
      stepTime: this.stepTime,
      dashing: Boolean(input.dash),
    });

    this.visualRoot.position.y = feedback.bob;
    this.visualRoot.rotation.z = feedback.leanZ;
    this.visualRoot.rotation.x = feedback.leanX;
    this.shadow.scale.setScalar(feedback.shadowScale);
    this.shadow.material.opacity = feedback.shadowOpacity;
    this.halo.scale.setScalar(feedback.haloScale);
    this.halo.material.opacity = feedback.haloOpacity;
    this.halo.rotation.z += dt * (0.8 + feedback.normalizedSpeed * 1.8);
    if (this.backpackGlow?.material) {
      this.backpackGlow.material.emissiveIntensity = 0.9 + feedback.dashGlow;
      this.backpackGlow.material.opacity = 0.72 + feedback.normalizedSpeed * 0.12;
    }
    if (this.coreGlow?.material) {
      this.coreGlow.material.emissiveIntensity = 1 + feedback.dashGlow * 1.2;
    }

    if (this.mixer) {
      const walkAction = this.actions.Walking || this.actions.Running || null;
      const idleAction = this.actions.Idle || this.actions.Standing || null;
      if (this.speed > 1.4 && walkAction) this.setAction(walkAction);
      else if (idleAction) this.setAction(idleAction);
      this.mixer.update(dt * Math.min(1.35, 0.88 + this.speed / this.maxSpeed));
      return;
    }

    this.animatedParts.legLeft.rotation.x = feedback.swing;
    this.animatedParts.legRight.rotation.x = -feedback.swing;
    this.animatedParts.armLeft.rotation.x = -feedback.swing;
    this.animatedParts.armRight.rotation.x = feedback.swing;
    this.animatedParts.torso.rotation.y = input.moveX * 0.08;
    this.animatedParts.head.rotation.y = input.moveX * 0.12;
  }
}
