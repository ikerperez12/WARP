import * as THREE from "three";

import { CONFIG } from "../config.js";

/**
 * Creates and adds the central 3D Orb and its surrounding particles to the scene.
 * @param {THREE.Scene} scene - The Three.js scene to add the orb to.
 * @returns {Object} An object containing references to the orb's components and materials.
 */
export function addOrb(scene) {
  const group = new THREE.Group();

  // 1. Glowing Inner Core
  const innerGeo = new THREE.IcosahedronGeometry(CONFIG.orb.innerRadius, 15);
  const innerMat = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.accent,
    emissive: CONFIG.colors.accent,
    emissiveIntensity: 2,
    roughness: 0,
    metalness: 1,
  });
  const innerCore = new THREE.Mesh(innerGeo, innerMat);
  group.add(innerCore);

  // 2. Wireframe Shell
  const shellGeo = new THREE.IcosahedronGeometry(CONFIG.orb.shellRadius, 1);
  const shellMat = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.accent,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  group.add(shell);

  // 3. Floating Shards
  const shardGeo = new THREE.TetrahedronGeometry(0.1, 0);
  const shardMat = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.accent,
    emissive: CONFIG.colors.accent,
    emissiveIntensity: 0.5,
  });
  
  const shards = new THREE.Group();
  const shardCount = CONFIG.orb.shardCount;
  for(let i = 0; i < shardCount; i++) {
    const shard = new THREE.Mesh(shardGeo, shardMat);
    const r = 1.5 + Math.random() * 0.5;
    const phi = Math.acos(-1 + (2 * i) / shardCount);
    const theta = Math.sqrt(shardCount * Math.PI) * phi;
    
    shard.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    shard.rotation.set(Math.random(), Math.random(), Math.random());
    shards.add(shard);
  }
  group.add(shards);

  // 4. Particle Cloud (Digital Dust)
  const count = CONFIG.orb.particleCount;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = CONFIG.orb.particleMinRadius + Math.random() * (CONFIG.orb.particleMaxRadius - CONFIG.orb.particleMinRadius);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }

  const ptsGeo = new THREE.BufferGeometry();
  ptsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const ptsMat = new THREE.PointsMaterial({
    color: CONFIG.colors.accent,
    size: 0.02,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(ptsGeo, ptsMat);
  group.add(points);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const pointLight = new THREE.PointLight(CONFIG.colors.accent, 10, 20);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  scene.fog = new THREE.Fog(CONFIG.colors.bg, 5, 15);
  scene.add(group);

  return { group, innerCore, shell, shards, points, innerMat, shellMat, ptsMat };
}
