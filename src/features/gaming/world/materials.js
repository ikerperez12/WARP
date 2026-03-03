import * as THREE from 'three';

const palettes = {
  dark: {
    background: '#030712',
    fog: '#09111f',
    ground: '#101a2e',
    groundSecondary: '#16253d',
    platform: '#21314a',
    border: '#33547a',
    neutral: '#b9d6ff',
    emissive: '#4ef2df',
    lightA: '#64b8ff',
    lightB: '#ff9358',
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
      roughness: 0.9,
      metalness: 0.1,
      clearcoat: 0.08,
    }),
    platform: new THREE.MeshPhysicalMaterial({
      color: palette.platform,
      roughness: 0.52,
      metalness: 0.32,
      clearcoat: 0.16,
    }),
    border: new THREE.MeshPhysicalMaterial({
      color: palette.border,
      roughness: 0.32,
      metalness: 0.56,
      clearcoat: 0.28,
    }),
    neutral: new THREE.MeshPhysicalMaterial({
      color: palette.neutral,
      roughness: 0.24,
      metalness: 0.58,
      clearcoat: 0.34,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: palette.groundSecondary,
      roughness: 0.04,
      metalness: 0.56,
      transmission: 0.14,
      thickness: 0.4,
      clearcoat: 0.58,
      transparent: true,
      opacity: theme === 'light' ? 0.8 : 0.66,
    }),
    emissive(color = palette.emissive, intensity = 1.1) {
      const boostedIntensity = theme === 'light' ? intensity : intensity * 1.28;
      return new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: boostedIntensity,
        roughness: 0.18,
        metalness: 0.52,
        clearcoat: 0.22,
      });
    },
  };
}
