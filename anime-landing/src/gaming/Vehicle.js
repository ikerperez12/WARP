import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Vehicle {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;

    const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1));
    this.body = new CANNON.Body({
      mass: 50,
      position: new CANNON.Vec3(0, 5, 0),
      material: new CANNON.Material({ friction: 0.1, restitution: 0.5 }),
    });
    this.body.addShape(shape);
    this.body.angularDamping = 0.9;
    this.world.addBody(this.body);

    this.mesh = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(1, 1, 2);
    this.bodyMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x00ff41,
      emissiveIntensity: 0.1,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, this.bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.mesh.add(bodyMesh);

    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    this.headMat = new THREE.MeshStandardMaterial({
      color: 0x00ff41,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x00ff41,
      emissiveIntensity: 0.5,
    });
    const headMesh = new THREE.Mesh(headGeo, this.headMat);
    headMesh.position.set(0, 0.7, 1.2);
    headMesh.castShadow = true;
    this.mesh.add(headMesh);

    const eyeGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeL = new THREE.Mesh(eyeGeo, this.eyeMat);
    eyeL.position.set(0.3, 0.8, 1.6);
    const eyeR = new THREE.Mesh(eyeGeo, this.eyeMat);
    eyeR.position.set(-0.3, 0.8, 1.6);
    this.mesh.add(eyeL, eyeR);

    const engineGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
    engineGeo.rotateZ(Math.PI / 2);
    this.engineMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.2,
    });

    const e1 = new THREE.Mesh(engineGeo, this.engineMat);
    e1.position.set(0.6, -0.4, 0.8);
    const e2 = new THREE.Mesh(engineGeo, this.engineMat);
    e2.position.set(-0.6, -0.4, 0.8);
    const e3 = new THREE.Mesh(engineGeo, this.engineMat);
    e3.position.set(0.6, -0.4, -0.8);
    const e4 = new THREE.Mesh(engineGeo, this.engineMat);
    e4.position.set(-0.6, -0.4, -0.8);
    this.mesh.add(e1, e2, e3, e4);

    this.scene.add(this.mesh);

    this.engineForce = 1500;
    this.turnSpeed = 3;
  }

  setTheme(theme) {
    const isLight = theme === 'light';
    this.bodyMat.color.setHex(isLight ? 0x31424a : 0x111111);
    this.bodyMat.emissive.setHex(isLight ? 0x0e9f6e : 0x00ff41);
    this.bodyMat.emissiveIntensity = isLight ? 0.06 : 0.1;

    this.headMat.color.setHex(isLight ? 0x0e9f6e : 0x00ff41);
    this.headMat.emissive.setHex(isLight ? 0x0e9f6e : 0x00ff41);
    this.headMat.emissiveIntensity = isLight ? 0.24 : 0.5;

    this.engineMat.color.setHex(isLight ? 0x6d7f86 : 0x333333);
    this.eyeMat.color.setHex(isLight ? 0x102028 : 0xffffff);
  }

  update(controlsState, dt) {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);

    let power = 0;
    if (controlsState.forward) power += this.engineForce;
    if (controlsState.backward) power -= this.engineForce;
    if (controlsState.boost) power += this.engineForce * 2;

    if (power !== 0) {
      this.body.applyLocalForce(new CANNON.Vec3(0, 0, power), new CANNON.Vec3(0, 0, 0));
    }

    let turn = 0;
    if (controlsState.left) turn += this.turnSpeed;
    if (controlsState.right) turn -= this.turnSpeed;

    if (turn !== 0) {
      const currentVel = this.body.velocity.length();
      if (currentVel > 1) {
        this.body.torque.y = turn * 200;
      }
    }

    if (controlsState.reset) {
      this.body.position.set(0, 5, 0);
      this.body.velocity.set(0, 0, 0);
      this.body.angularVelocity.set(0, 0, 0);
      this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0);
    }
  }
}
