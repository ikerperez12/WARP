import * as THREE from 'three';

const palettes = {
  dark: {
    background: '#060810',
    fog: '#0f1324',
    ground: '#0f172a',
    groundSecondary: '#111f31',
    platform: '#17273d',
    border: '#263a56',
    neutral: '#9fb6ff',
    emissive: '#3cf5d2',
    lightA: '#45a3ff',
    lightB: '#ff7043',
  },
  light: {
    background: '#edf3ff',
    fog: '#dce8ff',
    ground: '#dbe4f5',
    groundSecondary: '#cfdcf0',
    platform: '#f8fbff',
    border: '#9fb5d9',
    neutral: '#35507a',
    emissive: '#147f70',
    lightA: '#1476db',
    lightB: '#d15325',
  },
};

export function getPalette(theme = 'dark') {
  return palettes[theme] || palettes.dark;
}

export function createMaterialLibrary(theme = 'dark') {
  const palette = getPalette(theme);

  return {
    palette,
    ground: new THREE.MeshStandardMaterial({ color: palette.ground, roughness: 0.92, metalness: 0.08 }),
    platform: new THREE.MeshStandardMaterial({ color: palette.platform, roughness: 0.78, metalness: 0.15 }),
    border: new THREE.MeshStandardMaterial({ color: palette.border, roughness: 0.55, metalness: 0.3 }),
    neutral: new THREE.MeshStandardMaterial({ color: palette.neutral, roughness: 0.45, metalness: 0.45 }),
    glass: new THREE.MeshStandardMaterial({
      color: palette.groundSecondary,
      roughness: 0.15,
      metalness: 0.65,
      transparent: true,
      opacity: theme === 'light' ? 0.78 : 0.58,
    }),
    emissive(color = palette.emissive, intensity = 1.1) {
      return new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: intensity,
        roughness: 0.3,
        metalness: 0.42,
      });
    },
  };
}
