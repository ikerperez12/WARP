import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
        this.init();
    }

    init() {
        // Basic floor grid
        const size = 200;
        const divisions = 50;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x00ff41, 0x011100);
        gridHelper.position.y = -0.5;
        this.scene.add(gridHelper);

        // Add some dummy obstacles
        for (let i = 0; i < 5; i++) {
            this.addObstacle();
        }
    }

    addObstacle() {
        const geo = new THREE.BoxGeometry(2, 2, 2);
        const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geo, mat);

        mesh.position.set(
            (Math.random() - 0.5) * 40,
            0.5,
            -Math.random() * 100 - 20
        );

        this.scene.add(mesh);
        this.obstacles.push({ mesh, type: 'obstacle' });
    }

    update(delta, speed) {
        // Move obstacles towards player to simulate forward movement
        this.obstacles.forEach((obs, index) => {
            obs.mesh.position.z += speed * delta;

            // Reset if passed behind camera
            if (obs.mesh.position.z > 10) {
                obs.mesh.position.z = -100 - Math.random() * 50;
                obs.mesh.position.x = (Math.random() - 0.5) * 40;
            }
        });
    }

    getObstacles() {
        return this.obstacles;
    }

    reset() {
        // Clear and respawn obstacles
        this.obstacles.forEach((obs) => {
            obs.mesh.position.z = -100 - Math.random() * 50;
            obs.mesh.position.x = (Math.random() - 0.5) * 40;
        });
    }
}
