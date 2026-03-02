import * as THREE from 'three';

export class Physics {
    constructor() {
        this.raycaster = new THREE.Raycaster();
    }

    checkCollisions(player, obstacles) {
        // Simple mock collision bounds for Vercel build. 
        // This can be replaced with real Cannon.js logic if the user opts for full physics.

        if (!player || !player.mesh) return { hit: false };

        const playerBox = new THREE.Box3().setFromObject(player.mesh);

        for (let obs of obstacles) {
            if (!obs.mesh) continue;
            const obsBox = new THREE.Box3().setFromObject(obs.mesh);
            if (playerBox.intersectsBox(obsBox)) {
                return { hit: true, type: obs.type || 'obstacle' };
            }
        }

        return { hit: false };
    }
}
