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
    ground: new THREE.MeshPhysicalMaterial({
      color: palette.ground,
      roughness: 0.96,
      metalness: 0.06,
      clearcoat: 0.02,
    }),
    platform: new THREE.MeshPhysicalMaterial({
      color: palette.platform,
      roughness: 0.68,
      metalness: 0.24,
      clearcoat: 0.08,
    }),
    border: new THREE.MeshPhysicalMaterial({
      color: palette.border,
      roughness: 0.44,
      metalness: 0.42,
      clearcoat: 0.18,
    }),
    neutral: new THREE.MeshPhysicalMaterial({
      color: palette.neutral,
      roughness: 0.34,
      metalness: 0.52,
      clearcoat: 0.24,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: palette.groundSecondary,
      roughness: 0.08,
      metalness: 0.5,
      transmission: 0.06,
      thickness: 0.4,
      clearcoat: 0.44,
      transparent: true,
      opacity: theme === 'light' ? 0.78 : 0.58,
    }),
    emissive(color = palette.emissive, intensity = 1.1) {
      return new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: intensity,
        roughness: 0.24,
        metalness: 0.48,
        clearcoat: 0.16,
      });
    },
  };
}
