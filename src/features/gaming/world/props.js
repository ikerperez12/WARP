import * as THREE from 'three';

export function createColumn(material, height = 10, radius = 1.4) {
  const column = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.15, height, 8), material);
  column.castShadow = true;
  column.receiveShadow = true;
  return column;
}

export function createPad(material, ringMaterial, radius = 5) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.8, 28), material);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.72, 0.26, 10, 36), ringMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.42;
  base.receiveShadow = true;
  group.add(base, ring);
  return group;
}

export function createBeacon(material, accentMaterial) {
  const group = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 3.4, 6), material);
  stem.position.y = 1.7;
  const head = new THREE.Mesh(new THREE.OctahedronGeometry(1.4, 0), accentMaterial);
  head.position.y = 4.3;
  group.add(stem, head);
  return group;
}

export function createBridge(material, width = 20, depth = 6) {
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(width, 1.2, depth), material);
  bridge.receiveShadow = true;
  bridge.castShadow = true;
  return bridge;
}

export function createHoloPanel(material, accentMaterial) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.6, 1.2), material);
  base.position.y = 1.3;
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.8), accentMaterial);
  pane.position.y = 4.1;
  pane.position.z = 0.2;
  group.add(base, pane);
  return group;
}
