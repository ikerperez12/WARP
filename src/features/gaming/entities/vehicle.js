import * as THREE from 'three';
import { clampToWorld, normalizeInput } from '../systems/collision.js';

export class VehicleEntity {
  constructor(materials) {
    this.group = new THREE.Group();
    this.velocity = new THREE.Vector2();
    this.heading = 0;
    this.speed = 0;
    this.maxSpeed = 34;
    this.acceleration = 48;
    this.drag = 8;

    const body = new THREE.Mesh(new THREE.BoxGeometry(6, 2.4, 8.4), materials.neutral);
    body.position.y = 2.1;
    body.castShadow = true;

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 3.6), materials.glass);
    cabin.position.set(0, 3.2, -0.2);

    const nose = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1, 1.4), materials.emissive('#ffb703', 1.4));
    nose.position.set(0, 2.1, 4.2);

    const fin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.8, 0.6), materials.emissive('#3cf5d2', 1.1));
    fin.position.set(0, 3.6, -3.9);

    this.group.add(body, cabin, nose, fin);
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

  update(input, dt) {
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
  }
}
