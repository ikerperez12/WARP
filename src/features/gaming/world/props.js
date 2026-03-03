import * as THREE from 'three';

export function createColumn(material, height = 10, radius = 1.4) {
  const group = new THREE.Group();
  const column = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.15, height, 8), material);
  column.castShadow = true;
  column.receiveShadow = true;
  group.add(column);

  const bandMaterial = new THREE.MeshBasicMaterial({
    color: '#8ceeff',
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
  });
  [-0.18, 0.22].forEach((ratio) => {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.92, Math.max(0.05, radius * 0.08), 8, 24),
      bandMaterial,
    );
    band.rotation.x = Math.PI / 2;
    band.position.y = height * (0.5 + ratio);
    group.add(band);
  });

  return group;
}

export function createPad(material, ringMaterial, radius = 5) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.8, 28), material);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.72, 0.26, 10, 36), ringMaterial);
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.68, radius * 0.68, 0.12, 24),
    new THREE.MeshStandardMaterial({
      color: '#d8f4ff',
      roughness: 0.24,
      metalness: 0.36,
    }),
  );
  const strip = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 0.94, radius * 0.16),
    new THREE.MeshBasicMaterial({
      color: '#6fefff',
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.42;
  plate.position.y = 0.46;
  strip.rotation.x = -Math.PI / 2;
  strip.position.y = 0.49;
  base.receiveShadow = true;
  group.add(base, ring, plate, strip);
  return group;
}

export function createBeacon(material, accentMaterial) {
  const group = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 3.4, 6), material);
  stem.position.y = 1.7;
  const head = new THREE.Mesh(new THREE.OctahedronGeometry(1.4, 0), accentMaterial);
  head.position.y = 4.3;
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.08, 8, 24),
    accentMaterial,
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 3.2;
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 1.15, 0.42, 12),
    material,
  );
  base.position.y = 0.22;
  group.add(base, stem, head, collar);
  return group;
}

export function createBridge(material, width = 20, depth = 6) {
  const group = new THREE.Group();
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(width, 1.2, depth), material);
  bridge.receiveShadow = true;
  bridge.castShadow = true;
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.82, 0.08, Math.max(0.8, depth * 0.16)),
    new THREE.MeshStandardMaterial({
      color: '#5fe8ff',
      emissive: '#5fe8ff',
      emissiveIntensity: 0.74,
      roughness: 0.12,
      metalness: 0.42,
    }),
  );
  strip.position.y = 0.66;
  const sideLeft = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.96, 0.22, 0.26),
    new THREE.MeshStandardMaterial({
      color: '#d8f2ff',
      roughness: 0.2,
      metalness: 0.34,
    }),
  );
  sideLeft.position.set(0, 0.76, -depth * 0.38);
  const sideRight = sideLeft.clone();
  sideRight.position.z *= -1;
  group.add(bridge, strip, sideLeft, sideRight);
  return group;
}

export function createHoloPanel(material, accentMaterial) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.6, 1.2), material);
  base.position.y = 1.3;
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.8), accentMaterial);
  pane.position.y = 4.1;
  pane.position.z = 0.2;
  const header = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.18, 0.2),
    new THREE.MeshStandardMaterial({
      color: '#d8f7ff',
      emissive: '#69ecff',
      emissiveIntensity: 0.62,
      roughness: 0.18,
      metalness: 0.42,
    }),
  );
  header.position.set(0, 5.4, 0.18);
  group.add(base, pane, header);
  return group;
}
