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

function measureRenderableAsset(asset) {
  if (!asset?.scene) return null;
  asset.scene.updateMatrixWorld?.(true);
  const bounds = new THREE.Box3();
  let meshCount = 0;
  let initialized = false;

  asset.scene.traverse((child) => {
    if (!child?.isMesh || !child.geometry?.attributes?.position?.count) return;
    const childBounds = new THREE.Box3().setFromObject(child);
    if (!Number.isFinite(childBounds.min.x) || !Number.isFinite(childBounds.max.x)) return;
    if (initialized) bounds.union(childBounds);
    else {
      bounds.copy(childBounds);
      initialized = true;
    }
    meshCount += 1;
  });

  if (!initialized || meshCount === 0) return null;
  const size = bounds.getSize(new THREE.Vector3());
  return {
    bounds,
    size,
    meshCount,
    maxSpan: Math.max(size.x, size.y, size.z),
    footprint: Math.max(size.x, size.z),
  };
}

function isRenderableVehicleAsset(asset) {
  const metrics = measureRenderableAsset(asset);
  if (!metrics) return false;
  return metrics.maxSpan > 0.32 && metrics.footprint > 0.22;
}

function resolveVehicleAssetSet(assets = null) {
  const candidates = [
    {
      id: 'default',
      chassis: assets?.defaultCarChassis,
      wheel: assets?.defaultCarWheel,
      antenna: assets?.defaultCarAntenna,
      brake: assets?.defaultCarBrake,
    },
    {
      id: 'cybertruck',
      chassis: assets?.cybertruckChassis,
      wheel: assets?.cybertruckWheel,
      antenna: assets?.cybertruckAntenna,
      brake: assets?.cybertruckBrake,
    },
  ];

  for (const candidate of candidates) {
    if (!isRenderableVehicleAsset(candidate.chassis) || !isRenderableVehicleAsset(candidate.wheel)) continue;
    return candidate;
  }

  return null;
}

function createHeroFallbackVehicle(materials) {
  const group = new THREE.Group();
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.72, 4.4),
    new THREE.MeshStandardMaterial({
      color: '#b9d5ff',
      emissive: '#46d7ff',
      emissiveIntensity: 0.16,
      metalness: 0.62,
      roughness: 0.24,
    }),
  );
  chassis.position.y = 0.76;
  chassis.castShadow = true;
  chassis.receiveShadow = true;

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.54, 0.86, 1.9),
    materials.glass.clone(),
  );
  cabin.position.set(0, 1.3, -0.16);
  cabin.castShadow = true;
  cabin.receiveShadow = true;

  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.18, 0.86),
    materials.emissive('#7de9ff', 1.08),
  );
  nose.position.set(0, 0.88, 2.16);

  const rearBar = createFallbackBrakeLight();
  rearBar.scale.set(1.16, 1, 1);
  rearBar.position.set(0, 0.76, -2.22);

  group.add(chassis, cabin, nose, rearBar);
  return { group, brake: rearBar };
}

function deriveVehicleLayout(bounds) {
  const size = bounds.getSize(new THREE.Vector3());
  return {
    wheelHeight: Math.max(0.72, Math.min(1.05, size.y * 0.44)),
    wheelX: Math.max(0.68, size.x * 0.34),
    wheelFrontZ: -Math.max(0.84, size.z * 0.28),
    wheelRearZ: Math.max(0.92, size.z * 0.29),
    wheelY: Math.max(0.28, size.y * 0.17),
    antennaPosition: new THREE.Vector3(size.x * 0.03, Math.max(1.08, size.y * 0.84), -size.z * 0.3),
    brakePosition: new THREE.Vector3(0, Math.max(0.38, size.y * 0.34), Math.max(1.02, size.z * 0.47)),
    shadowWidth: Math.max(2.8, size.x * 1.46),
    shadowDepth: Math.max(4.4, size.z * 1.24),
  };
}

export function hasImportedVehicleCore(assets = null) {
  return Boolean(resolveVehicleAssetSet(assets));
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

    const vehicleAssets = resolveVehicleAssetSet(assets);

    if (vehicleAssets) {
      const chassisTint = vehicleAssets.id === 'default' ? '#9ee6ff' : '#3cf5d2';
      const chassis = instantiateAsset(vehicleAssets.chassis, {
        height: vehicleAssets.id === 'default' ? 2.45 : 2.18,
        tint: chassisTint,
        tintStrength: vehicleAssets.id === 'default' ? 0.08 : 0.16,
        emissiveBoost: vehicleAssets.id === 'default' ? 0.08 : 0.14,
      });
      chassis.position.y = 0.08;
      const chassisBounds = new THREE.Box3().setFromObject(chassis);
      const layout = deriveVehicleLayout(chassisBounds);
      this.shadow.scale.set(layout.shadowWidth / 2.2, 1, layout.shadowDepth / 2.2);
      this.accentMaterials.push(...collectEmissiveMaterials(chassis));
      this.group.add(chassis);

      const canopyHalo = new THREE.Mesh(
        new THREE.TorusGeometry(Math.max(0.42, layout.shadowWidth * 0.18), 0.06, 8, 28),
        materials.emissive(vehicleAssets.id === 'default' ? '#7be3ff' : '#3cf5d2', 0.82),
      );
      canopyHalo.rotation.x = Math.PI / 2;
      canopyHalo.position.set(0, Math.max(0.96, chassisBounds.max.y * 0.64), -layout.brakePosition.z * 0.18);
      this.group.add(canopyHalo);

      this.antenna = vehicleAssets.antenna
        ? instantiateAsset(vehicleAssets.antenna, {
            height: Math.max(0.88, layout.wheelHeight),
            tint: '#8ceaff',
            tintStrength: 0.24,
            emissiveBoost: 0.16,
          })
        : createFallbackAntenna();
      this.antenna.position.copy(layout.antennaPosition);
      this.group.add(this.antenna);

      const brake = vehicleAssets.brake
        ? instantiateAsset(vehicleAssets.brake, {
            height: 0.32,
            tint: '#ffb703',
            tintStrength: 0.5,
            emissiveBoost: 0.5,
          })
        : createFallbackBrakeLight();
      brake.position.copy(layout.brakePosition);
      this.brakeMaterials = collectEmissiveMaterials(brake);
      this.group.add(brake);

      const wheelOffsets = [
        [-layout.wheelX, layout.wheelY, layout.wheelFrontZ],
        [layout.wheelX, layout.wheelY, layout.wheelFrontZ],
        [-layout.wheelX, layout.wheelY, layout.wheelRearZ],
        [layout.wheelX, layout.wheelY, layout.wheelRearZ],
      ];

      this.wheels = wheelOffsets.map(([x, y, z], index) => {
        const wheel = instantiateAsset(vehicleAssets.wheel, {
          height: layout.wheelHeight,
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
      const fallback = createHeroFallbackVehicle(materials);
      const fallbackBounds = new THREE.Box3().setFromObject(fallback.group);
      const layout = deriveVehicleLayout(fallbackBounds);
      this.shadow.scale.set(layout.shadowWidth / 2.2, 1, layout.shadowDepth / 2.2);
      this.accentMaterials.push(...collectEmissiveMaterials(fallback.group));
      this.group.add(fallback.group);

      this.antenna = createFallbackAntenna();
      this.antenna.position.copy(layout.antennaPosition);
      this.group.add(this.antenna);

      const brake = fallback.brake;
      this.brakeMaterials = collectEmissiveMaterials(brake);

      const wheelGeometry = new THREE.CylinderGeometry(0.34, 0.34, 0.28, 16);
      const wheelMaterial = new THREE.MeshStandardMaterial({
        color: '#111827',
        metalness: 0.44,
        roughness: 0.36,
      });
      const wheelOffsets = [
        [-layout.wheelX, layout.wheelY, layout.wheelFrontZ],
        [layout.wheelX, layout.wheelY, layout.wheelFrontZ],
        [-layout.wheelX, layout.wheelY, layout.wheelRearZ],
        [layout.wheelX, layout.wheelY, layout.wheelRearZ],
      ];
      this.wheels = wheelOffsets.map(([x, y, z], index) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, y, z);
        wheel.castShadow = true;
        wheel.receiveShadow = true;
        wheel.userData.baseRotationY = index > 1 ? Math.PI : 0;
        wheel.rotation.y = wheel.userData.baseRotationY;
        this.group.add(wheel);
        return wheel;
      });
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
