import * as THREE from 'three';
import { WORLD_LAYOUT } from './layout.js';
import { SECTORS } from './sectors.js';
import { createMaterialLibrary, getPalette } from './materials.js';
import { createBeacon, createBridge, createColumn, createHoloPanel, createPad } from './props.js';

function tintObject(object, color, intensity = 1.1) {
  object.traverse((child) => {
    const material = child.material;
    if (!material || !('color' in material)) return;
    if (material.emissive) {
      material.color.set(color);
      material.emissive.set(color);
      material.emissiveIntensity = intensity;
    }
  });
}

export class GameWorld {
  constructor({ canvas, theme = 'dark' }) {
    this.canvas = canvas;
    this.theme = theme;
    this.materials = createMaterialLibrary(theme);
    this.renderer = null;
    this.scene = new THREE.Scene();
    this.interactables = [];
    this.interactableById = new Map();
    this.sectorMeshes = new Map();
    this.hazards = [];
    this.orbiters = [];
    this.dockRings = [];
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);

    this.applyTheme(this.theme);
    this.buildLights();
    this.buildGround();
    this.buildSectors();
    this.buildCorridors();
    this.buildInteractables();
    this.buildScenery();
  }

  buildLights() {
    this.ambient = new THREE.AmbientLight('#d4e7ff', this.theme === 'light' ? 1.45 : 0.55);
    this.sun = new THREE.DirectionalLight('#8fb8ff', this.theme === 'light' ? 1.55 : 1.1);
    this.sun.position.set(40, 80, 20);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.camera.left = -180;
    this.sun.shadow.camera.right = 180;
    this.sun.shadow.camera.top = 180;
    this.sun.shadow.camera.bottom = -180;
    this.scene.add(this.ambient, this.sun);
  }

  buildGround() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), this.materials.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(380, 38, this.materials.palette.border, this.materials.palette.groundSecondary);
    grid.position.y = 0.08;
    grid.material.opacity = this.theme === 'light' ? 0.22 : 0.18;
    grid.material.transparent = true;
    this.scene.add(grid);
  }

  buildSectors() {
    for (const sector of SECTORS) {
      const group = new THREE.Group();
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(sector.radius, sector.radius + 5, 2, 48),
        this.materials.platform,
      );
      base.position.set(sector.center.x, 1, sector.center.z);
      base.receiveShadow = true;
      base.castShadow = true;
      group.add(base);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(sector.radius * 0.78, 0.9, 12, 64),
        this.materials.emissive(sector.accent, this.theme === 'light' ? 0.7 : 1),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(sector.center.x, 1.6, sector.center.z);
      group.add(ring);
      this.dockRings.push(ring);

      const label = new THREE.Mesh(
        new THREE.BoxGeometry(8, 1, 8),
        this.materials.emissive(sector.glow, this.theme === 'light' ? 0.7 : 1.1),
      );
      label.position.set(sector.center.x, 1.6, sector.center.z);
      group.add(label);

      if (sector.id === 'boot-relay') {
        const tower = createColumn(this.materials.neutral, 18, 2.4);
        tower.position.set(sector.center.x, 9, sector.center.z);
        const cap = new THREE.Mesh(new THREE.OctahedronGeometry(4), this.materials.emissive(sector.accent, 1.4));
        cap.position.set(sector.center.x, 19, sector.center.z);
        group.add(tower, cap);
      }

      if (sector.id === 'firewall-sector') {
        const gateLeft = createColumn(this.materials.border, 16, 1.6);
        gateLeft.position.set(sector.center.x - 15, 8, sector.center.z + 2);
        const gateRight = createColumn(this.materials.border, 16, 1.6);
        gateRight.position.set(sector.center.x + 15, 8, sector.center.z + 2);
        const gateBeam = new THREE.Mesh(new THREE.BoxGeometry(30, 1.4, 1.2), this.materials.emissive(sector.accent, 1.35));
        gateBeam.position.set(sector.center.x, 13.8, sector.center.z + 2);
        group.add(gateLeft, gateRight, gateBeam);
      }

      if (sector.id === 'routing-array') {
        for (const offset of [-16, 0, 16]) {
          const tower = createColumn(this.materials.neutral, 14, 1.4);
          tower.position.set(sector.center.x + offset, 7.5, sector.center.z - 12);
          group.add(tower);
        }
        const bridge = createBridge(this.materials.glass, 28, 8);
        bridge.position.set(sector.center.x + 10, 4, sector.center.z);
        group.add(bridge);
      }

      if (sector.id === 'inference-core') {
        const orb = new THREE.Mesh(new THREE.SphereGeometry(5.4, 18, 18), this.materials.emissive(sector.accent, 1.4));
        orb.position.set(sector.center.x, 12, sector.center.z);
        group.add(orb);
        this.orbiters.push({ object: orb, radius: 0, speed: 1 });
        for (let index = 0; index < 4; index += 1) {
          const node = new THREE.Mesh(new THREE.IcosahedronGeometry(1.9, 0), this.materials.emissive(sector.glow, 1.1));
          node.position.set(
            sector.center.x + Math.cos((Math.PI * 2 * index) / 4) * 10,
            8,
            sector.center.z + Math.sin((Math.PI * 2 * index) / 4) * 10,
          );
          group.add(node);
          this.orbiters.push({ object: node, center: sector.center, radius: 10 + index, speed: 0.6 + index * 0.15, angle: index });
        }
      }

      if (sector.id === 'core-chamber') {
        const coreRing = new THREE.Mesh(
          new THREE.TorusKnotGeometry(7, 1.4, 100, 14),
          this.materials.emissive(sector.glow, 1.2),
        );
        coreRing.position.set(sector.center.x, 13, sector.center.z - 2);
        group.add(coreRing);
        this.orbiters.push({ object: coreRing, radius: 0, speed: 0.5 });
      }

      this.sectorMeshes.set(sector.id, group);
      this.scene.add(group);
    }
  }

  buildCorridors() {
    const corridors = [
      { x: -39, z: -6, width: 34, depth: 10, rotation: 0.1 },
      { x: 42, z: -5, width: 34, depth: 10, rotation: -0.1 },
      { x: 0, z: 46, width: 10, depth: 44, rotation: 0 },
      { x: 0, z: -48, width: 10, depth: 44, rotation: 0 },
    ];

    corridors.forEach((corridor) => {
      const mesh = createBridge(this.materials.border, corridor.width, corridor.depth);
      mesh.position.set(corridor.x, 1.4, corridor.z);
      mesh.rotation.y = corridor.rotation;
      this.scene.add(mesh);
    });
  }

  buildInteractables() {
    const addDock = (id, position, sectorId) => {
      const dock = createPad(this.materials.platform, this.materials.emissive('#46e0ff', 1.2));
      dock.position.set(position.x, 0.2, position.z);
      this.registerInteractable({ id, type: 'dock', position, sectorId, object: dock, tint: '#46e0ff' });
    };

    const addBeacon = (item, type, sectorId, color) => {
      const object = createBeacon(this.materials.neutral, this.materials.emissive(color, 1.3));
      object.position.set(item.x, 0, item.z);
      this.registerInteractable({ ...item, type, sectorId, position: { x: item.x, z: item.z }, object, tint: color });
    };

    const addPanel = (item, type, sectorId, color) => {
      const object = createHoloPanel(this.materials.border, this.materials.emissive(color, 1.25));
      object.position.set(item.x, 0, item.z);
      this.registerInteractable({ ...item, type, sectorId, position: { x: item.x, z: item.z }, object, tint: color });
    };

    addBeacon({ id: 'boot-beacon', ...WORLD_LAYOUT.boot.bootBeacon }, 'boot-beacon', 'boot-relay', '#3cf5d2');
    addDock('boot-dock', WORLD_LAYOUT.boot.dock, 'boot-relay');

    addDock('firewall-dock', WORLD_LAYOUT.firewall.dock, 'firewall-sector');
    WORLD_LAYOUT.firewall.beacons.forEach((item) => addBeacon(item, 'security-beacon', 'firewall-sector', '#ff764a'));
    WORLD_LAYOUT.firewall.shards.forEach((item) => addBeacon(item, 'security-shard', 'firewall-sector', '#ffb703'));
    WORLD_LAYOUT.firewall.nodes.forEach((item) => addPanel(item, 'security-node', 'firewall-sector', '#ff4d6d'));

    addDock('routing-dock', WORLD_LAYOUT.routing.dock, 'routing-array');
    WORLD_LAYOUT.routing.towers.forEach((item) => addBeacon(item, 'routing-tower', 'routing-array', '#39a7ff'));
    WORLD_LAYOUT.routing.switches.forEach((item) => addPanel(item, 'routing-switch', 'routing-array', '#9ad7ff'));

    addDock('inference-dock', WORLD_LAYOUT.inference.dock, 'inference-core');
    WORLD_LAYOUT.inference.seeds.forEach((item) => addBeacon(item, 'inference-seed', 'inference-core', '#b06cff'));
    WORLD_LAYOUT.inference.terminals.forEach((item) => addPanel(item, 'inference-terminal', 'inference-core', '#d3adff'));

    addDock('core-dock', WORLD_LAYOUT.core.dock, 'core-chamber');
    WORLD_LAYOUT.core.pylons.forEach((item) => addBeacon(item, 'core-pylon', 'core-chamber', '#ffd166'));
    addPanel(WORLD_LAYOUT.core.console, 'core-console', 'core-chamber', '#ffe28f');

    WORLD_LAYOUT.firewall.lasers.forEach((laser) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(laser.axis === 'x' ? 18 : 1.2, 1.2, laser.axis === 'z' ? 18 : 1.2),
        this.materials.emissive('#ff385c', 1.3),
      );
      mesh.position.set(laser.anchor.x, 1.1, laser.anchor.z);
      this.hazards.push({ ...laser, object: mesh, position: { x: laser.anchor.x, z: laser.anchor.z } });
      this.scene.add(mesh);
    });
  }

  buildScenery() {
    const scatter = [
      [-118, -42], [-106, -18], [-96, 22], [-44, -34], [-24, 32], [28, -35], [56, 22], [96, 28], [112, -22], [18, 124], [-22, 106], [20, -122], [-20, -110],
    ];

    scatter.forEach(([x, z], index) => {
      const height = 4 + (index % 5) * 2.2;
      const tower = createColumn(this.materials.border, height, 1.1 + (index % 3) * 0.25);
      tower.position.set(x, height / 2, z);
      this.scene.add(tower);
    });

    for (let index = 0; index < 18; index += 1) {
      const spark = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7 + (index % 2) * 0.3), this.materials.emissive('#5edfff', 0.8));
      const angle = (Math.PI * 2 * index) / 18;
      const radius = 38 + (index % 5) * 22;
      spark.position.set(Math.cos(angle) * radius, 4 + (index % 4) * 4, Math.sin(angle) * radius);
      this.orbiters.push({ object: spark, radius, speed: 0.18 + (index % 4) * 0.04, angle });
      this.scene.add(spark);
    }
  }

  registerInteractable(data) {
    data.object.userData.interactableId = data.id;
    data.object.traverse((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
    });
    this.interactables.push({ ...data, active: true });
    this.interactableById.set(data.id, this.interactables[this.interactables.length - 1]);
    this.scene.add(data.object);
  }

  addEntity(object) {
    this.scene.add(object);
  }

  getInteractables() {
    return this.interactables;
  }

  setInteractableState(id, state) {
    const item = this.interactableById.get(id);
    if (!item) return;
    if (state === 'hidden') {
      item.active = false;
      item.object.visible = false;
      return;
    }
    if (state === 'locked') {
      item.active = false;
      item.object.visible = true;
      tintObject(item.object, this.theme === 'light' ? '#8ea0bf' : '#44546f', 0.28);
      return;
    }
    if (state === 'complete') {
      item.active = true;
      tintObject(item.object, '#3cf5d2', 1.5);
      return;
    }
    if (state === 'warning') {
      tintObject(item.object, '#ff4d6d', 1.6);
      return;
    }
    if (state === 'idle') {
      item.object.visible = true;
      item.active = true;
      if (item.tint) tintObject(item.object, item.tint, 1.25);
    }
  }

  applyTheme(theme = 'dark') {
    this.theme = theme;
    const palette = getPalette(theme);
    this.scene.background = new THREE.Color(palette.background);
    this.scene.fog = new THREE.Fog(palette.fog, 70, 250);
    if (this.ambient) this.ambient.intensity = theme === 'light' ? 1.45 : 0.55;
    if (this.sun) {
      this.sun.intensity = theme === 'light' ? 1.55 : 1.1;
      this.sun.color.set(theme === 'light' ? '#8aa5ff' : '#9cc8ff');
    }
    if (this.materials?.ground) this.materials.ground.color.set(palette.ground);
    if (this.materials?.platform) this.materials.platform.color.set(palette.platform);
    if (this.materials?.border) this.materials.border.color.set(palette.border);
    if (this.materials?.neutral) this.materials.neutral.color.set(palette.neutral);
    if (this.materials?.glass) this.materials.glass.color.set(palette.groundSecondary);
  }

  resize() {
    this.renderer?.setSize(window.innerWidth, window.innerHeight, false);
  }

  update(dt, elapsed = 0) {
    for (const ring of this.dockRings) {
      ring.rotation.z += dt * 0.35;
      ring.position.y = 1.6 + Math.sin(elapsed * 1.1 + ring.position.x * 0.02) * 0.12;
    }

    for (const orbiter of this.orbiters) {
      orbiter.angle = (orbiter.angle || 0) + dt * orbiter.speed;
      if (orbiter.center) {
        orbiter.object.position.x = orbiter.center.x + Math.cos(orbiter.angle) * orbiter.radius;
        orbiter.object.position.z = orbiter.center.z + Math.sin(orbiter.angle) * orbiter.radius;
        orbiter.object.position.y = 8 + Math.sin(orbiter.angle * 1.6) * 2.4;
      } else {
        orbiter.object.rotation.x += dt * orbiter.speed;
        orbiter.object.rotation.y += dt * orbiter.speed * 1.5;
      }
    }

    for (const laser of this.hazards) {
      const offset = Math.sin(elapsed * laser.speed) * laser.range;
      if (laser.axis === 'x') laser.object.position.x = laser.anchor.x + offset;
      if (laser.axis === 'z') laser.object.position.z = laser.anchor.z + offset;
      laser.position.x = laser.object.position.x;
      laser.position.z = laser.object.position.z;
    }
  }

  render(camera) {
    this.renderer.render(this.scene, camera);
  }
}
