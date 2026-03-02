import * as THREE from 'three';

export class CameraFollow {
    constructor(camera, targetMesh) {
        this.camera = camera;
        this.target = targetMesh;

        // Offset relative to the car (behind and above)
        this.offset = new THREE.Vector3(0, 8, -15);

        // Current smoothed position to eliminate jitter from physics
        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
    }

    update(dt) {
        if (!this.target) return;

        // Ideal camera position based on the target (the cyber-goat)
        const idealPosition = this.target.position.clone().add(this.offset);

        // Smoothly interpolate current camera position towards ideal position
        const t = 1.0 - Math.pow(0.01, dt); // frame-rate independent lerp factor

        this.currentPosition.lerp(idealPosition, t);
        this.camera.position.copy(this.currentPosition);

        // Look slightly ahead of the vehicle
        const idealLookAt = this.target.position.clone().add(new THREE.Vector3(0, 0, 5));
        this.currentLookAt.lerp(idealLookAt, t);

        this.camera.lookAt(this.currentLookAt);
    }
}
