import * as THREE from "three";

export function addOrb(scene) {
  const group = new THREE.Group();

  const coreGeo = new THREE.IcosahedronGeometry(1.15, 2);
  const coreMat = new THREE.MeshStandardMaterial({
    roughness: 0.32,
    metalness: 0.12,
    emissive: new THREE.Color(0x111111),
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  const ringGeo = new THREE.TorusGeometry(2.05, 0.02, 18, 220);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xb6ff3b,
    opacity: 0.45,
    transparent: true,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI * 0.5;
  group.add(ring);

  const count = 1400;
  const pos = new Float32Array(count * 3);
  const rnd = (a, b) => a + Math.random() * (b - a);

  for (let i = 0; i < count; i++) {
    const r = rnd(2.4, 3.8);
    const ang = rnd(0, Math.PI * 2);
    const y = rnd(-1.1, 1.1);

    pos[i * 3 + 0] = Math.cos(ang) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(ang) * r;
  }

  const ptsGeo = new THREE.BufferGeometry();
  ptsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

  const ptsMat = new THREE.PointsMaterial({
    color: 0xb6ff3b,
    size: 0.015,
    opacity: 0.55,
    transparent: true,
    depthWrite: false,
  });

  const points = new THREE.Points(ptsGeo, ptsMat);
  group.add(points);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  const key = new THREE.DirectionalLight(0xffffff, 0.95);
  key.position.set(4, 2, 3);
  scene.add(key);

  scene.fog = new THREE.Fog(0x0b0f14, 7, 16);

  scene.add(group);

  return { group, core, ring, points, coreMat, ringMat, ptsMat };
}
