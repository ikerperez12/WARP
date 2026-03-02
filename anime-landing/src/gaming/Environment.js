import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Environment {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.obstacleMaterials = [];
    this.debrisMaterials = [];

    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({ mass: 0 });
    floorBody.addShape(floorShape);
    floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(floorBody);

    const gridSize = 400;
    const divisions = 100;
    const floorGeo = new THREE.PlaneGeometry(gridSize, gridSize, divisions, divisions);

    this.floorMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.1,
      metalness: 0.8,
    });

    const floorMesh = new THREE.Mesh(floorGeo, this.floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    this.gridHelper = new THREE.GridHelper(gridSize, divisions, 0x00ff41, 0x003b00);
    this.gridHelper.position.y = 0.01;
    this.gridHelper.material.opacity = 0.5;
    this.gridHelper.material.transparent = true;
    this.scene.add(this.gridHelper);

    this.createObstacles();
  }

  createObstacles() {
    for (let i = 0; i < 30; i++) {
      const width = 2 + Math.random() * 8;
      const height = 1 + Math.random() * 10;
      const depth = 2 + Math.random() * 8;

      const x = (Math.random() - 0.5) * 150;
      const z = (Math.random() - 0.5) * 150;
      if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;

      const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
      const body = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(x, height / 2, z) });
      body.addShape(shape);
      this.world.addBody(body);

      const geo = new THREE.BoxGeometry(width, height, depth);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.7,
        metalness: 0.3,
        emissive: 0x00ff41,
        emissiveIntensity: Math.random() > 0.8 ? 0.5 : 0,
      });
      this.obstacleMaterials.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(body.position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    }

    for (let i = 0; i < 15; i++) {
      const radius = 1 + Math.random();
      const shape = new CANNON.Sphere(radius);
      const body = new CANNON.Body({ mass: 10 });
      body.addShape(shape);
      body.position.set((Math.random() - 0.5) * 100, 10 + Math.random() * 20, (Math.random() - 0.5) * 100);
      this.world.addBody(body);

      const geo = new THREE.IcosahedronGeometry(radius, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x00ff41,
        wireframe: true,
        emissive: 0x00ff41,
        emissiveIntensity: 2,
      });
      this.debrisMaterials.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      this.scene.add(mesh);

      const update = () => {
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
        requestAnimationFrame(update);
      };
      update();
    }
  }

  setTheme(theme) {
    const isLight = theme === 'light';
    this.floorMat.color.setHex(isLight ? 0xd8e3ea : 0x050505);
    this.floorMat.roughness = isLight ? 0.28 : 0.1;
    this.floorMat.metalness = isLight ? 0.32 : 0.8;

    const gridMaterials = Array.isArray(this.gridHelper.material) ? this.gridHelper.material : [this.gridHelper.material];
    gridMaterials.forEach((material, index) => {
      material.color.setHex(isLight ? (index === 0 ? 0x0e9f6e : 0x8bd0bb) : (index === 0 ? 0x00ff41 : 0x003b00));
      material.opacity = isLight ? 0.32 : 0.5;
      material.transparent = true;
    });

    this.obstacleMaterials.forEach((mat) => {
      mat.color.setHex(isLight ? 0x90a4ae : 0x111111);
      mat.emissive.setHex(isLight ? 0x0e9f6e : 0x00ff41);
      mat.emissiveIntensity = isLight ? 0.08 : mat.emissiveIntensity;
    });

    this.debrisMaterials.forEach((mat) => {
      mat.color.setHex(isLight ? 0x0e9f6e : 0x00ff41);
      mat.emissive.setHex(isLight ? 0x0e9f6e : 0x00ff41);
      mat.emissiveIntensity = isLight ? 1.1 : 2;
    });
  }
}
