import * as THREE from 'three';
import { clampToWorld, normalizeInput } from '../systems/collision.js';
import { instantiateAsset } from '../world/assets.js';

function clampUnit(value) {
  return Math.max(0, Math.min(1, value));
}

function collectEmissiveMaterials(object) {
  const materials = [];
  object?.traverse((child) => {
    if (!child?.material) return;
    const list = Array.isArray(child.material) ? child.material : [child.material];
    list.forEach((material) => {
      if (!material?.emissive) return;
      materials.push({
        material,
        baseIntensity: material.emissiveIntensity ?? 1,
      });
    });
  });
  return materials;
}

function createFallbackAntenna() {
  const group = new THREE.Group();
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.04, 0.9, 8),
    new THREE.MeshStandardMaterial({
      color: '#a7ebff',
      emissive: '#57d8ff',
      emissiveIntensity: 0.36,
      metalness: 0.68,
      roughness: 0.22,
    }),
  );
  mast.position.y = 0.45;

  const tip = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 10, 10),
    new THREE.MeshStandardMaterial({
      color: '#d6f8ff',
      emissive: '#8be7ff',
      emissiveIntensity: 0.52,
      metalness: 0.18,
      roughness: 0.34,
    }),
  );
  tip.position.y = 0.92;
  group.add(mast, tip);
  return group;
}

function createFallbackBrakeLight() {
  return new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.14, 0.18),
    new THREE.MeshStandardMaterial({
      color: '#ffb36b',
      emissive: '#ff7a45',
      emissiveIntensity: 0.6,
      metalness: 0.18,
      roughness: 0.28,
    }),
  );
}

export function hasImportedVehicleCore(assets = null) {
  return Boolean(assets?.cybertruckChassis && assets?.cybertruckWheel);
}

export function computeVehicleFeedback({
  speed = 0,
  previousSpeed = speed,
  maxSpeed = 34,
  velocityX = 0,
  velocityY = 0,
  inputX = 0,
  boost = false,
  bodyFloat = 0,
  moving = false,
} = {}) {
  const normalizedSpeed = clampUnit(speed / Math.max(maxSpeed, 0.001));
  const steering = Math.max(-1, Math.min(1, inputX));
  const slowingHard = previousSpeed - speed > 0.8;
  const coastingBrake = !moving && speed > maxSpeed * 0.18;
  const boostAmount = boost ? 1 : 0;
  const brakeStrength = clampUnit(
    (slowingHard ? 0.58 : 0)
    + (coastingBrake ? 0.34 : 0)
    + (boost ? 0.08 : 0)
    + normalizedSpeed * 0.18,
  );

  return {
    normalizedSpeed,
    bodyOffset: Math.sin(bodyFloat) * Math.min(0.12, speed * 0.004),
    roll: velocityX * 0.004 - steering * (0.035 + normalizedSpeed * 0.02),
    pitch: -velocityY * 0.0015 - normalizedSpeed * 0.035 - boostAmount * 0.028,
    steerAngle: steering * (0.1 + normalizedSpeed * 0.3),
    antennaPitch: Math.sin(bodyFloat * 0.6) * 0.03 + normalizedSpeed * 0.04,
    antennaRoll: steering * 0.08 + Math.cos(bodyFloat * 0.8) * 0.02,
    brakeStrength,
    shadowScale: 1 + normalizedSpeed * 0.08 + boostAmount * 0.06,
    shadowOpacity: 0.18 + normalizedSpeed * 0.1 + boostAmount * 0.04,
    boostGlow: 0.18 + normalizedSpeed * 0.5 + boostAmount * 0.9,
    squashY: 1 - boostAmount * 0.025,
    squashXZ: 1 + boostAmount * 0.03,
  };
}

export class VehicleEntity {
  constructor(materials, assets = null) {
    this.group = new THREE.Group();
    this.velocity = new THREE.Vector2();
    this.heading = 0;
    this.speed = 0;
    this.maxSpeed = 34;
    this.acceleration = 48;
    this.drag = 8;
    this.bodyFloat = 0;
    this.wheels = [];
    this.antenna = null;
    this.brakeMaterials = [];
    this.accentMaterials = [];
    this.shadow = new THREE.Mesh(
      new THREE.CircleGeometry(2.2, 32),
      new THREE.MeshBasicMaterial({
        color: '#05111f',
        transparent: true,
        opacity: 0.22,
      }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.04;
    this.group.add(this.shadow);

    if (hasImportedVehicleCore(assets)) {
      const chassis = instantiateAsset(assets.cybertruckChassis, {
        height: 2.1,
        tint: '#3cf5d2',
        tintStrength: 0.16,
        emissiveBoost: 0.14,
      });
      chassis.position.y = 0.14;
      this.accentMaterials.push(...collectEmissiveMaterials(chassis));
      this.group.add(chassis);

      this.antenna = assets?.cybertruckAntenna
        ? instantiateAsset(assets.cybertruckAntenna, {
            height: 1.05,
            tint: '#8ceaff',
            tintStrength: 0.24,
            emissiveBoost: 0.16,
          })
        : createFallbackAntenna();
      this.antenna.position.set(0.08, 1.82, -0.95);
      this.group.add(this.antenna);

      const brake = assets?.cybertruckBrake
        ? instantiateAsset(assets.cybertruckBrake, {
            height: 0.3,
            tint: '#ffb703',
            tintStrength: 0.5,
            emissiveBoost: 0.5,
          })
        : createFallbackBrakeLight();
      brake.position.set(0, 0.74, 1.36);
      this.brakeMaterials = collectEmissiveMaterials(brake);
      this.group.add(brake);

      const wheelOffsets = [
        [-0.88, 0.34, -1.14],
        [0.88, 0.34, -1.14],
        [-0.88, 0.34, 1.18],
        [0.88, 0.34, 1.18],
      ];

      this.wheels = wheelOffsets.map(([x, y, z], index) => {
        const wheel = instantiateAsset(assets.cybertruckWheel, {
          height: 1.08,
          tint: '#111a27',
          tintStrength: 0.18,
        });
        wheel.position.set(x, y, z);
        wheel.rotation.z = Math.PI / 2;
        wheel.userData.baseRotationY = index > 1 ? Math.PI : 0;
        wheel.rotation.y = wheel.userData.baseRotationY;
        this.group.add(wheel);
        return wheel;
      });
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(6, 2.4, 8.4), materials.neutral);
      body.position.y = 2.1;
      body.castShadow = true;

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 3.6), materials.glass);
      cabin.position.set(0, 3.2, -0.2);

      const nose = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1, 1.4), materials.emissive('#ffb703', 1.4));
      nose.position.set(0, 2.1, 4.2);

      const fin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.8, 0.6), materials.emissive('#3cf5d2', 1.1));
      fin.position.set(0, 3.6, -3.9);

      this.antenna = createFallbackAntenna();
      this.antenna.position.set(0, 4.2, -2.8);

      const brake = createFallbackBrakeLight();
      brake.position.set(0, 2.08, -4.18);
      this.brakeMaterials = collectEmissiveMaterials(brake);

      this.group.add(body, cabin, nose, fin, this.antenna, brake);
    }
    this.group.position.set(0, 0, 0);
    this.group.userData.entity = 'vehicle';
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

  getHeading() {
    return this.heading;
  }

  update(input, dt) {
    const previousSpeed = this.speed;
    const rawX = input.moveX;
    const rawY = input.moveY;
    const moving = rawX !== 0 || rawY !== 0;

    if (moving) {
      const dir = normalizeInput(rawX, rawY);
      const boost = input.boost ? 1.28 : 1;
      this.velocity.x += dir.x * this.acceleration * boost * dt;
      this.velocity.y += -dir.y * this.acceleration * boost * dt;
      const speed = this.velocity.length();
      const limit = this.maxSpeed * boost;
      if (speed > limit) this.velocity.setLength(limit);
      this.heading = Math.atan2(this.velocity.x, this.velocity.y);
      this.group.rotation.y = this.heading;
    } else {
      this.velocity.multiplyScalar(Math.max(0, 1 - this.drag * dt));
    }

    this.group.position.x += this.velocity.x * dt;
    this.group.position.z += this.velocity.y * dt;
    const clamped = clampToWorld(this.group.position);
    this.group.position.x = clamped.x;
    this.group.position.z = clamped.z;
    this.speed = this.velocity.length();
    this.bodyFloat += dt * (2.2 + this.speed * 0.03);

    const feedback = computeVehicleFeedback({
      speed: this.speed,
      previousSpeed,
      maxSpeed: this.maxSpeed,
      velocityX: this.velocity.x,
      velocityY: this.velocity.y,
      inputX: rawX,
      boost: Boolean(input.boost),
      bodyFloat: this.bodyFloat,
      moving,
    });

    this.group.position.y = feedback.bodyOffset;
    this.group.rotation.z = feedback.roll;
    this.group.rotation.x = feedback.pitch;
    if (this.shadow?.material) {
      this.shadow.scale.setScalar(feedback.shadowScale);
      this.shadow.material.opacity = feedback.shadowOpacity;
    }
    this.group.scale.set(feedback.squashXZ, feedback.squashY, feedback.squashXZ);

    if (this.wheels.length) {
      const wheelSpin = this.speed * dt * 0.22;
      this.wheels.forEach((wheel, index) => {
        wheel.rotation.x -= wheelSpin;
        const baseY = wheel.userData.baseRotationY ?? 0;
        wheel.rotation.y = index < 2 ? baseY + feedback.steerAngle : baseY;
      });
    }

    if (this.antenna) {
      this.antenna.rotation.x = feedback.antennaPitch;
      this.antenna.rotation.z = feedback.antennaRoll;
    }

    this.brakeMaterials.forEach(({ material, baseIntensity }) => {
      material.emissiveIntensity = baseIntensity + feedback.brakeStrength * 1.8;
    });
    this.accentMaterials.forEach(({ material, baseIntensity }) => {
      material.emissiveIntensity = Math.max(baseIntensity, baseIntensity + feedback.boostGlow);
    });
  }
}
