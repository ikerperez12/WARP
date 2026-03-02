import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Vehicle {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;

        // 1. Create the Physics Body for our Cyber-Goat/Dino
        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1)); // Roughly goat/dino body size
        this.body = new CANNON.Body({
            mass: 50, // Not too heavy to make it fun and bouncy
            position: new CANNON.Vec3(0, 5, 0), // Drop from sky
            material: new CANNON.Material({ friction: 0.1, restitution: 0.5 })
        });
        this.body.addShape(shape);
        // Angular damping prevents indefinite spinning
        this.body.angularDamping = 0.9;
        this.world.addBody(this.body);

        // 2. Create the Visual Mesh (High End Rendering)
        this.mesh = new THREE.Group();

        // Core body
        const bodyGeo = new THREE.BoxGeometry(1, 1, 2);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0x00ff41,
            emissiveIntensity: 0.1
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        this.mesh.add(bodyMesh);

        // Head (Funny geometric dino head)
        const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0x00ff41, // Neon Green
            roughness: 0.1,
            metalness: 0.9,
            emissive: 0x00ff41,
            emissiveIntensity: 0.5
        });
        const headMesh = new THREE.Mesh(headGeo, headMat);
        headMesh.position.set(0, 0.7, 1.2);
        headMesh.castShadow = true;
        this.mesh.add(headMesh);

        // Eyes (Extra neon)
        const eyeGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(0.3, 0.8, 1.6);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(-0.3, 0.8, 1.6);
        this.mesh.add(eyeL, eyeR);

        // Thrusters / Wheels equivalent
        const engineGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
        engineGeo.rotateZ(Math.PI / 2);
        const engineMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });

        const e1 = new THREE.Mesh(engineGeo, engineMat);
        e1.position.set(0.6, -0.4, 0.8);
        const e2 = new THREE.Mesh(engineGeo, engineMat);
        e2.position.set(-0.6, -0.4, 0.8);
        const e3 = new THREE.Mesh(engineGeo, engineMat);
        e3.position.set(0.6, -0.4, -0.8);
        const e4 = new THREE.Mesh(engineGeo, engineMat);
        e4.position.set(-0.6, -0.4, -0.8);
        this.mesh.add(e1, e2, e3, e4);

        this.scene.add(this.mesh);

        // Logic props
        this.engineForce = 1500;
        this.turnSpeed = 3;
    }

    update(controlsState, dt) {
        // Sync Visuals to Physics
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);

        // Simple Arcade-like Physics Control using Cannon applyLocalForce
        // W/S = Forward/Backward
        // A/D = Rotate (Steer)

        const forwardDirection = new CANNON.Vec3(0, 0, 1);
        const rightDirection = new CANNON.Vec3(1, 0, 0);

        let power = 0;
        if (controlsState.forward) power += this.engineForce;
        if (controlsState.backward) power -= this.engineForce;
        if (controlsState.boost) power += this.engineForce * 2; // Space to Boost!

        if (power !== 0) {
            // Apply force pushed from the back
            this.body.applyLocalForce(new CANNON.Vec3(0, 0, power), new CANNON.Vec3(0, 0, 0));
        }

        // Steering
        let turn = 0;
        if (controlsState.left) turn += this.turnSpeed;
        if (controlsState.right) turn -= this.turnSpeed;

        if (turn !== 0) {
            const currentVel = this.body.velocity.length();
            // Only can turn if moving (mostly)
            if (currentVel > 1) {
                // Torque for turning
                this.body.torque.y = turn * 200;
            }
        }

        // Recover if upside down
        if (controlsState.reset) {
            this.body.position.set(0, 5, 0);
            this.body.velocity.set(0, 0, 0);
            this.body.angularVelocity.set(0, 0, 0);
            this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0);
        }
    }
}
