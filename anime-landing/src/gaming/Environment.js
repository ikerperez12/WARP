import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Environment {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;

        // 1. Floor Physics
        const floorShape = new CANNON.Plane();
        const floorBody = new CANNON.Body({
            mass: 0, // static
        });
        floorBody.addShape(floorShape);
        floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Flat on XZ
        this.world.addBody(floorBody);

        // 2. Floor Visuals (High-End Neon Cyberpunk Grid)
        const gridSize = 400;
        const divisions = 100;

        // Modern Shader implementation for infinite fading grid
        const floorGeo = new THREE.PlaneGeometry(gridSize, gridSize, divisions, divisions);

        // We create a shiny floor that catches reflections and bloom
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x050505,
            roughness: 0.1, // very shiny
            metalness: 0.8,
        });

        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.receiveShadow = true;
        this.scene.add(floorMesh);

        // The Grid Helper to give it the "cyber" look
        const gridHelper = new THREE.GridHelper(gridSize, divisions, 0x00ff41, 0x003b00);
        gridHelper.position.y = 0.01;
        gridHelper.material.opacity = 0.5;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);

        // 3. Add Obstacles (Procedural Brutalist Architecture)
        this.createObstacles();
    }

    createObstacles() {
        for (let i = 0; i < 30; i++) {
            const width = 2 + Math.random() * 8;
            const height = 1 + Math.random() * 10;
            const depth = 2 + Math.random() * 8;

            const x = (Math.random() - 0.5) * 150;
            const z = (Math.random() - 0.5) * 150;

            // Exclude spawn area
            if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;

            // Physics
            const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
            const body = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(x, height / 2, z) });
            body.addShape(shape);
            this.world.addBody(body);

            // Visual
            const geo = new THREE.BoxGeometry(width, height, depth);
            const mat = new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.7,
                metalness: 0.3,
                emissive: 0x00ff41,
                emissiveIntensity: Math.random() > 0.8 ? 0.5 : 0 // Random glowing buildings
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(body.position);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        }

        // Some scattered bouncy balls or debris
        for (let i = 0; i < 15; i++) {
            const radius = 1 + Math.random();
            const shape = new CANNON.Sphere(radius);
            const body = new CANNON.Body({ mass: 10 });
            body.addShape(shape);
            body.position.set((Math.random() - 0.5) * 100, 10 + Math.random() * 20, (Math.random() - 0.5) * 100);
            this.world.addBody(body);

            const geo = new THREE.IcosahedronGeometry(radius, 1);
            const mat = new THREE.MeshStandardMaterial({ color: 0x00ff41, wireframe: true, emissive: 0x00ff41, emissiveIntensity: 2 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true;

            this.scene.add(mesh);

            // Update loop hack for these isolated rigidbodies
            const update = () => {
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
                requestAnimationFrame(update);
            };
            update();
        }
    }
}
