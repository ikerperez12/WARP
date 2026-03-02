import * as THREE from 'three';
import { clampToWorld, normalizeInput } from '../systems/collision.js';

export class AvatarEntity {
  constructor(materials) {
    this.group = new THREE.Group();
    this.velocity = new THREE.Vector2();
    this.speed = 0;
    this.maxSpeed = 18;
    this.acceleration = 36;
    this.drag = 11;
    this.stepTime = 0;

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

    this.animatedParts = { legLeft, legRight, armLeft, armRight };
    this.group.add(torso, head, legLeft, legRight, armLeft, armRight);
    this.group.userData.entity = 'avatar';
    this.group.position.set(0, 0, 0);
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
      this.stepTime += dt * 10;
    } else {
      this.velocity.multiplyScalar(Math.max(0, 1 - this.drag * dt));
      this.stepTime += dt * 4;
    }

    this.group.position.x += this.velocity.x * dt;
    this.group.position.z += this.velocity.y * dt;
    const clamped = clampToWorld(this.group.position);
    this.group.position.x = clamped.x;
    this.group.position.z = clamped.z;
    this.speed = this.velocity.length();

    const swing = Math.sin(this.stepTime) * Math.min(this.speed / this.maxSpeed, 1) * 0.7;
    this.animatedParts.legLeft.rotation.x = swing;
    this.animatedParts.legRight.rotation.x = -swing;
    this.animatedParts.armLeft.rotation.x = -swing;
    this.animatedParts.armRight.rotation.x = swing;
  }
}
