import * as THREE from 'three';

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.velocity = new THREE.Vector3();
    this.acceleration = 40;
    this.friction = 0.92;
    this.bounds = { x: 8, y: 5 };

    this.createMesh();
  }

  createMesh() {
    // Sonda de seguridad: Octaedro con nucleo brillante
    const group = new THREE.Group();

    // Nucleo
    const coreGeom = new THREE.OctahedronGeometry(0.4, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f2ff,
      emissive: 0x00f2ff,
      emissiveIntensity: 2,
      wireframe: false
    });
    this.core = new THREE.Mesh(coreGeom, coreMat);
    group.add(this.core);

    // Escudo exterior (wireframe)
    const shellGeom = new THREE.OctahedronGeometry(0.6, 0);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x00f2ff,
      emissive: 0x00f2ff,
      emissiveIntensity: 0.5,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    this.shell = new THREE.Mesh(shellGeom, shellMat);
    group.add(this.shell);

    // Luz de punto para iluminar el entorno
    this.light = new THREE.PointLight(0x00f2ff, 2, 10);
    group.add(this.light);

    this.mesh = group;
    this.mesh.position.set(0, 0, 0);
    this.scene.add(this.mesh);
  }

  update(delta, controls) {
    // Movement logic
    const moveX = (controls.keys.right ? 1 : 0) - (controls.keys.left ? 1 : 0);
    const moveY = (controls.keys.forward ? 1 : 0) - (controls.keys.backward ? 1 : 0);

    this.velocity.x += moveX * this.acceleration * delta;
    this.velocity.y += moveY * this.acceleration * delta;

    // Apply friction
    this.velocity.multiplyScalar(this.friction);

    // Apply movement
    this.mesh.position.x += this.velocity.x * delta;
    this.mesh.position.y += this.velocity.y * delta;

    // Boundary check
    if (Math.abs(this.mesh.position.x) > this.bounds.x) {
      this.mesh.position.x = Math.sign(this.mesh.position.x) * this.bounds.x;
      this.velocity.x *= -0.5;
    }
    if (Math.abs(this.mesh.position.y) > this.bounds.y) {
      this.mesh.position.y = Math.sign(this.mesh.position.y) * this.bounds.y;
      this.velocity.y *= -0.5;
    }

    // Visual animations
    const time = performance.now() * 0.001;
    this.core.rotation.y = time * 2;
    this.core.rotation.x = time * 1.5;
    this.shell.rotation.y = -time * 1;
    this.shell.rotation.z = time * 0.5;

    // Tilt effect based on velocity
    this.mesh.rotation.z = -this.velocity.x * 0.05;
    this.mesh.rotation.x = this.velocity.y * 0.05;
    
    // Pulse effect
    const pulse = 1 + Math.sin(time * 10) * 0.1;
    this.core.scale.set(pulse, pulse, pulse);
  }

  reset() {
    this.mesh.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
  }
}
