import * as CANNON from 'cannon-es';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0); // standard gravity
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.solver.iterations = 10;

        // Default Material
        this.defaultMaterial = new CANNON.Material('default');
        const defaultContactMaterial = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            {
                friction: 0.1,
                restitution: 0.3, // Bounciness
            }
        );
        this.world.addContactMaterial(defaultContactMaterial);
    }

    update(dt) {
        // Step the physics world
        this.world.step(1 / 60, dt, 3);
    }
}
