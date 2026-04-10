import * as THREE from 'three';

export function createStarLayer(config, texture) {
  const { count, spreadX, spreadY, depth, size, opacity, parallax, speed } = config;

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * spreadX;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
    positions[i * 3 + 2] = (Math.random() - 0.5) * depth;

    let color;
    const roll = Math.random();
    if (roll < 0.86) {
      color = new THREE.Color(0xe5f0ff);
    } else if (roll < 0.96) {
      color = new THREE.Color(0xc7d8ff);
    } else {
      color = new THREE.Color(0xc084fc);
    }

    color.multiplyScalar(0.64 + Math.random() * 0.36);
    colors[i * 3 + 0] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    map: texture,
    size,
    transparent: true,
    opacity,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);

  return {
    points,
    geometry,
    material,
    baseOpacity: opacity,
    parallax,
    speed,
    phase: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.34 + Math.random() * 0.28,
    twinkleAmount: 0.07 + Math.random() * 0.05,
  };
}
