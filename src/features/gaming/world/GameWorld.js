import * as THREE from 'three';
import { WORLD_LAYOUT } from './layout.js';
import { SECTORS } from './sectors.js';
import { createMaterialLibrary, getPalette } from './materials.js';
import { createBeacon, createBridge, createColumn, createHoloPanel, createPad } from './props.js';
import { instantiateAsset, loadGameAssets, tintImportedModel } from './assets.js';

let shadowTexture;
const labelTextureCache = new Map();
const districtSurfaceTextureCache = new Map();

function nextFrame() {
  return new Promise((resolve) => {
    const schedule = globalThis.requestAnimationFrame
      ? globalThis.requestAnimationFrame.bind(globalThis)
      : (callback) => globalThis.setTimeout(callback, 16);
    schedule(() => resolve());
  });
}

function getViewportMetrics(env = globalThis, canvas = null) {
  return {
    width: env.innerWidth || canvas?.clientWidth || 1280,
    height: env.innerHeight || canvas?.clientHeight || 720,
    dpr: env.devicePixelRatio || 1,
  };
}

function replaceCanvasNode(canvas) {
  const parent = canvas?.parentNode;
  if (!canvas || !parent) return canvas;
  const replacement = canvas.cloneNode(false);
  replacement.width = canvas.width;
  replacement.height = canvas.height;
  parent.replaceChild(replacement, canvas);
  return replacement;
}

function getRendererAttemptPlan(compatibility = false) {
  const richProfile = {
    label: 'rich',
    contextNames: ['webgl2', 'webgl'],
    contextAttributes: {
      alpha: false,
      antialias: true,
      depth: true,
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      stencil: false,
    },
    rendererOptions: {
      alpha: false,
      antialias: true,
      depth: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
      precision: 'highp',
      preserveDrawingBuffer: false,
      stencil: false,
    },
  };

  const compatibilityProfile = {
    label: 'compatibility',
    contextNames: ['webgl', 'experimental-webgl', 'webgl2'],
    contextAttributes: {
      alpha: false,
      antialias: false,
      depth: true,
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'default',
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      stencil: false,
    },
    rendererOptions: {
      alpha: false,
      antialias: false,
      depth: true,
      powerPreference: 'default',
      premultipliedAlpha: false,
      precision: 'mediump',
      preserveDrawingBuffer: false,
      stencil: false,
    },
  };

  const legacyProfile = {
    label: 'legacy',
    contextNames: ['experimental-webgl', 'webgl'],
    contextAttributes: {
      alpha: false,
      antialias: false,
      depth: true,
      failIfMajorPerformanceCaveat: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      stencil: false,
    },
    rendererOptions: {
      alpha: false,
      antialias: false,
      depth: true,
      powerPreference: 'low-power',
      premultipliedAlpha: false,
      precision: 'mediump',
      preserveDrawingBuffer: false,
      stencil: false,
    },
  };

  return compatibility
    ? [compatibilityProfile, legacyProfile]
    : [richProfile, compatibilityProfile, legacyProfile];
}

function createRenderer(canvas, compatibility = false) {
  let activeCanvas = canvas;
  const failures = [];
  const attempts = getRendererAttemptPlan(compatibility);

  for (const [index, attempt] of attempts.entries()) {
    try {
      let context = null;
      let contextName = null;

      for (const candidate of attempt.contextNames) {
        try {
          const resolved = activeCanvas.getContext(candidate, attempt.contextAttributes);
          if (!resolved) continue;
          context = resolved;
          contextName = candidate;
          break;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          failures.push(`[${attempt.label}:${candidate}] ${message}`);
        }
      }

      if (!context || !contextName) {
        throw new Error(`No se pudo adquirir contexto ${attempt.contextNames.join('/')}`);
      }

      const renderer = new THREE.WebGLRenderer({
        ...attempt.rendererOptions,
        canvas: activeCanvas,
        context,
      });
      renderer.__warpContextName = contextName;
      renderer.__warpRendererProfile = attempt.label;
      return { renderer, canvas: activeCanvas };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`[${attempt.label}] ${message}`);
      if (index < attempts.length - 1) {
        activeCanvas = replaceCanvasNode(activeCanvas);
      }
    }
  }

  throw new Error(failures.join(' | ') || 'No se pudo crear el renderer WebGL');
}

export function createWorldProfile(env = globalThis) {
  const nav = env.navigator ?? {};
  const view = env.window ?? env;
  const coarsePointer = Boolean(view.matchMedia?.('(pointer: coarse)')?.matches);
  const reducedMotion = Boolean(view.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const low = reducedMotion || coarsePointer || cores <= 4 || memory <= 4;
  const medium = low || cores <= 6 || memory <= 6;

  return {
    low,
    medium,
    perimeterStep: low ? 2 : 1,
    parkedCars: low ? 5 : medium ? 8 : 10,
    flowerCount: low ? 5 : medium ? 8 : 10,
    backdropDistricts: low ? 3 : 4,
    backdropBlocks: low ? 2 : medium ? 3 : 4,
    backdropRobot: true,
    ambientSparks: low ? 12 : medium ? 18 : 28,
    roadsideColumns: low ? 10 : medium ? 16 : 22,
    plazaMarkers: low ? 10 : medium ? 14 : 18,
  };
}

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

function worldPosFromObject(object) {
  return object.getWorldPosition(new THREE.Vector3());
}

function getShadowTexture() {
  if (shadowTexture) return shadowTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(128, 128, 18, 128, 128, 112);
  gradient.addColorStop(0, 'rgba(10, 15, 26, 0.85)');
  gradient.addColorStop(0.5, 'rgba(10, 15, 26, 0.36)');
  gradient.addColorStop(1, 'rgba(10, 15, 26, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  shadowTexture = new THREE.CanvasTexture(canvas);
  shadowTexture.colorSpace = THREE.SRGBColorSpace;
  return shadowTexture;
}

function getDistrictSurfaceTexture(theme = 'dark') {
  if (districtSurfaceTextureCache.has(theme)) return districtSurfaceTextureCache.get(theme);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  const isLight = theme === 'light';

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, isLight ? '#ebf4ff' : '#07111f');
  gradient.addColorStop(0.5, isLight ? '#ddeaff' : '#0b1730');
  gradient.addColorStop(1, isLight ? '#d2e3fb' : '#091524');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = isLight ? 0.08 : 0.12;
  for (let y = -canvas.height; y < canvas.height * 2; y += 42) {
    context.strokeStyle = isLight ? '#6f95c8' : '#2f4f74';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y + canvas.height * 0.4);
    context.stroke();
  }

  context.globalAlpha = isLight ? 0.06 : 0.1;
  for (let i = 0; i <= 32; i += 1) {
    const p = (canvas.width / 32) * i;
    context.strokeStyle = i % 4 === 0 ? (isLight ? '#7d9dcc' : '#2d4666') : (isLight ? '#9ab3d6' : '#173050');
    context.lineWidth = i % 4 === 0 ? 3 : 1;
    context.beginPath();
    context.moveTo(p, 0);
    context.lineTo(p, canvas.height);
    context.stroke();
    context.beginPath();
    context.moveTo(0, p);
    context.lineTo(canvas.width, p);
    context.stroke();
  }

  context.globalAlpha = isLight ? 0.12 : 0.2;
  context.fillStyle = isLight ? '#a7c7f8' : '#45dfff';
  for (let i = 0; i < 96; i += 1) {
    const x = (i * 97) % canvas.width;
    const y = (i * 151) % canvas.height;
    context.fillRect(x, y, 4 + (i % 3), 4 + (i % 2));
  }

  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.4, 3.4);
  districtSurfaceTextureCache.set(theme, texture);
  return texture;
}

function createGroundShadow(width = 6, depth = width, opacity = 0.22, color = '#02060c') {
  const material = new THREE.MeshBasicMaterial({
    map: getShadowTexture(),
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.04;
  mesh.renderOrder = 2;
  mesh.userData.isGroundShadow = true;
  return mesh;
}

function createTexturedFloorShadow(texture, width, depth, opacity = 0.72) {
  if (!texture) return null;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity,
    depthWrite: false,
    color: '#ffffff',
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.035;
  mesh.renderOrder = 1;
  mesh.userData.isGroundShadow = true;
  mesh.userData.isTexturedFloorShadow = true;
  return mesh;
}

function getLabelTexture(text, accent = '#46e0ff') {
  const key = `${text}::${accent}`;
  if (labelTextureCache.has(key)) return labelTextureCache.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.14, 'rgba(255, 255, 255, 0.08)');
  gradient.addColorStop(0.86, 'rgba(255, 255, 255, 0.08)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 24, canvas.width, canvas.height - 48);

  context.strokeStyle = accent;
  context.lineWidth = 4;
  context.strokeRect(64, 44, canvas.width - 128, canvas.height - 88);

  context.font = '700 88px "Space Grotesk", sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.shadowColor = accent;
  context.shadowBlur = 22;
  context.fillStyle = '#eff8ff';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  labelTextureCache.set(key, texture);
  return texture;
}

function createDistrictSign(text, accent, width = 15.5, height = 3.9) {
  const group = new THREE.Group();
  const frame = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.16,
    }),
  );
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.92, height * 0.78),
    new THREE.MeshBasicMaterial({
      map: getLabelTexture(text, accent),
      transparent: true,
      opacity: 0.98,
      depthWrite: false,
    }),
  );
  panel.position.z = 0.02;
  group.add(frame, panel);
  return group;
}

export class GameWorld {
  constructor({ canvas, theme = 'dark', compatibility = false }) {
    this.canvas = canvas;
    this.theme = theme;
    this.compatibility = compatibility;
    this.assetFallback = false;
    this.worldProfile = createWorldProfile();
    this.materials = createMaterialLibrary(theme);
    this.assets = null;
    this.renderer = null;
    this.scene = new THREE.Scene();
    this.interactables = [];
    this.interactableById = new Map();
    this.sectorMeshes = new Map();
    this.hazards = [];
    this.orbiters = [];
    this.dockRings = [];
    this.importedInstances = [];
    this.groundShadows = [];
    this.focusedInteractableId = null;
    this.focusRing = null;
    this.focusBeam = null;
  }

  async init({ onProgress } = {}) {
    const setProgress = (value) => onProgress?.(Math.max(0, Math.min(1, value)));
    const rendererState = createRenderer(this.canvas, this.compatibility);
    this.canvas = rendererState.canvas;
    this.renderer = rendererState.renderer;
    const viewport = getViewportMetrics(globalThis, this.canvas);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setSize(viewport.width, viewport.height, false);
    this.renderer.setPixelRatio(Math.min(viewport.dpr, this.compatibility ? 1.25 : 1.5));
    setProgress(0.02);

    try {
      this.assets = await loadGameAssets({
        onProgress: (value) => setProgress(value * 0.72),
        preloadOptional: !this.compatibility,
      });
    } catch (error) {
      console.warn('[gaming] Asset preload failed, continuing with scenic fallback', error);
      this.assetFallback = true;
      this.assets = {};
      setProgress(0.72);
    }

    this.applyTheme(this.theme);
    this.buildLights();
    this.buildGround();
    setProgress(0.76);
    await nextFrame();

    await this.buildSectors({
      onProgress: (value) => setProgress(0.76 + value * 0.08),
    });
    await this.buildCorridors({
      onProgress: (value) => setProgress(0.84 + value * 0.05),
    });
    await this.buildInteractables({
      onProgress: (value) => setProgress(0.89 + value * 0.05),
    });
    if (!this.assetFallback) {
      await this.buildScenery({
        onProgress: (value) => setProgress(0.94 + value * 0.05),
      });
    } else {
      this.buildCompatibilityScenery();
      setProgress(0.99);
      await nextFrame();
    }
    this.buildFocusHelpers();
    setProgress(1);
    await nextFrame();
  }

  buildCompatibilityScenery() {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(142, 156, 72),
      new THREE.MeshBasicMaterial({
        color: this.theme === 'light' ? '#9db5db' : '#16304d',
        transparent: true,
        opacity: this.theme === 'light' ? 0.12 : 0.2,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.08;
    this.scene.add(ring);

    [-140, 140].forEach((x) => {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(8, 22, 180),
        this.materials.border,
      );
      wall.position.set(x, 11, 0);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.scene.add(wall);
    });

    [-150, 150].forEach((z) => {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(180, 18, 8),
        this.materials.border,
      );
      wall.position.set(0, 9, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.scene.add(wall);
    });

    for (let index = 0; index < 10; index += 1) {
      const angle = (Math.PI * 2 * index) / 10;
      const radius = 124 + (index % 2) * 10;
      const node = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.1, 0),
        this.materials.emissive(index % 2 === 0 ? '#5edfff' : '#9d6dff', 0.72),
      );
      node.position.set(Math.cos(angle) * radius, 5 + (index % 3) * 1.2, Math.sin(angle) * radius);
      this.orbiters.push({ object: node, radius, speed: 0.14 + (index % 4) * 0.04, angle });
      this.scene.add(node);
    }
  }

  addImportedInstance(parent, key, options = {}) {
    const asset = this.assets?.[key];
    if (!asset) return null;
    const object = instantiateAsset(asset, options);
    if (options.shadow) {
      const shadow = createGroundShadow(
        options.shadow.width ?? Math.max(3.2, options.height ?? 4.2),
        options.shadow.depth ?? Math.max(3.2, (options.height ?? 4.2) * 1.1),
        options.shadow.opacity ?? 0.2,
        options.shadow.color ?? (this.theme === 'light' ? '#5e6f8d' : '#02060c'),
      );
      shadow.position.x = object.position.x + (options.shadow.offsetX ?? 0);
      shadow.position.y = options.shadow.y ?? 0.05;
      shadow.position.z = object.position.z + (options.shadow.offsetZ ?? 0);
      shadow.rotation.z = options.shadow.rotation ?? 0;
      this.groundShadows.push(shadow);
      parent.add(shadow);
    }
    if (options.tint) {
      object.userData.themeTint = options.tint;
      object.userData.themeTintStrength = options.tintStrength ?? 0.32;
      object.userData.themeEmissiveBoost = options.emissiveBoost ?? 0.18;
      this.importedInstances.push(object);
    }
    parent.add(object);
    return object;
  }

  addTexturedFloorShadow(parent, textureKey, options = {}) {
    const texture = this.assets?.[textureKey];
    if (!texture) return null;
    const shadow = createTexturedFloorShadow(
      texture,
      options.width ?? 10,
      options.depth ?? options.width ?? 10,
      options.opacity ?? (this.theme === 'light' ? 0.42 : 0.72),
    );
    if (!shadow) return null;
    shadow.position.x = options.position?.x ?? 0;
    shadow.position.y = options.position?.y ?? 0.035;
    shadow.position.z = options.position?.z ?? 0;
    shadow.rotation.z = options.rotation ?? 0;
    this.groundShadows.push(shadow);
    parent.add(shadow);
    return shadow;
  }

  createParkedCar({
    position,
    rotationY = 0,
    tint = '#7de1ff',
    height = 1.95,
    bunny = false,
  }) {
    if (!this.assets?.defaultCarChassis || !this.assets?.defaultCarWheel) return null;

    const group = new THREE.Group();
    const shadow = createGroundShadow(height * 2.4, height * 3.8, this.theme === 'light' ? 0.14 : 0.22);
    this.groundShadows.push(shadow);
    group.add(shadow);
    this.addImportedInstance(group, 'defaultCarChassis', {
      height,
      tint,
      tintStrength: 0.16,
      emissiveBoost: 0.1,
    });

    this.addImportedInstance(group, 'defaultCarAntenna', {
      height: height * 0.48,
      position: { x: 0.02, y: height * 0.78, z: -height * 0.38 },
      tint: '#caecff',
      tintStrength: 0.22,
      emissiveBoost: 0.08,
    });

    this.addImportedInstance(group, 'defaultCarBrake', {
      height: height * 0.14,
      position: { x: 0, y: height * 0.33, z: height * 0.56 },
      tint: '#ff9f62',
      tintStrength: 0.42,
      emissiveBoost: 0.38,
    });

    const wheelOffsets = [
      [-0.74, 0.28, -0.96],
      [0.74, 0.28, -0.96],
      [-0.74, 0.28, 1.04],
      [0.74, 0.28, 1.04],
    ];
    wheelOffsets.forEach(([x, y, z], index) => {
      const wheel = this.addImportedInstance(group, 'defaultCarWheel', {
        height: height * 0.42,
        position: { x, y, z },
        tint: '#0d1524',
        tintStrength: 0.2,
      });
      if (!wheel) return;
      wheel.rotation.z = Math.PI / 2;
      if (index > 1) wheel.rotation.y = Math.PI;
    });

    if (bunny) {
      this.addImportedInstance(group, 'defaultCarBunnyEarLeft', {
        height: height * 0.42,
        position: { x: -0.26, y: height * 0.9, z: -0.16 },
        tint: '#ffd7fa',
        tintStrength: 0.18,
        emissiveBoost: 0.06,
      });
      this.addImportedInstance(group, 'defaultCarBunnyEarRight', {
        height: height * 0.42,
        position: { x: 0.26, y: height * 0.9, z: -0.16 },
        tint: '#ffd7fa',
        tintStrength: 0.18,
        emissiveBoost: 0.06,
      });
    }

    group.position.set(position.x, position.y ?? 0, position.z);
    group.rotation.y = rotationY;
    this.scene.add(group);
    return group;
  }

  createFlowerPatch(center, count = 6, tint = '#9aefff') {
    if (!this.assets?.kenneyFlower) return;
    const flowerCount = Math.max(3, Math.min(count, this.worldProfile.flowerCount));
    for (let index = 0; index < flowerCount; index += 1) {
      const angle = (Math.PI * 2 * index) / count;
      const radius = 2.4 + (index % 3) * 1.1;
      this.addImportedInstance(this.scene, 'kenneyFlower', {
        height: 1.7 + (index % 2) * 0.35,
        rotationY: angle * 0.7,
        position: {
          x: center.x + Math.cos(angle) * radius,
          y: 0.06,
          z: center.z + Math.sin(angle) * radius,
        },
        tint,
        tintStrength: 0.16,
        emissiveBoost: 0.04,
        shadow: {
          width: 1.8,
          depth: 1.8,
          opacity: this.theme === 'light' ? 0.08 : 0.14,
        },
      });
    }
  }

  createBackdropDistrict({
    position = null,
    x = 0,
    y = 0,
    z = 0,
    rotationY = 0,
    accent = '#85dbff',
    glow = '#c7f3ff',
  }) {
    const group = new THREE.Group();
    const profile = this.worldProfile;
    const resolvedPosition = position ?? { x, y, z };

    this.addImportedInstance(group, 'mountainLandscape', {
      height: 32,
      position: { x: 0, y: -0.1, z: -8 },
      rotationY: Math.PI,
      tint: accent,
      tintStrength: 0.05,
      emissiveBoost: 0.02,
    });

    [
      { x: -24, z: 12, height: 20, rot: Math.PI * 0.08, tint: accent },
      { x: 0, z: -2, height: 24, rot: Math.PI * 0.22, tint: glow },
      { x: 25, z: 11, height: 18, rot: -Math.PI * 0.12, tint: accent },
    ].slice(0, profile.backdropBlocks).forEach((block) => {
      this.addImportedInstance(group, 'cityBlock', {
        height: block.height,
        position: { x: block.x, y: 0.1, z: block.z },
        rotationY: block.rot,
        tint: block.tint,
        tintStrength: 0.08,
        emissiveBoost: 0.04,
      });
    });

    [
      { x: -34, z: 16, h: 8.2 },
      { x: -12, z: -10, h: 10.8 },
      { x: 14, z: -12, h: 11.4 },
      { x: 36, z: 15, h: 7.8 },
    ].forEach((spire, index) => {
      const tower = createColumn(this.materials.border, spire.h, 0.7 + (index % 2) * 0.14);
      tower.position.set(spire.x, spire.h / 2, spire.z);
      group.add(tower);

      const cap = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.9 + (index % 2) * 0.2),
        this.materials.emissive(index % 2 === 0 ? accent : glow, 0.8),
      );
      cap.position.set(spire.x, spire.h + 0.8, spire.z);
      group.add(cap);
      this.orbiters.push({ object: cap, radius: 0, speed: 0.16 + index * 0.03 });
    });

    if (profile.backdropRobot) {
      this.addImportedInstance(group, 'robotExpressive', {
        height: 4.8,
        position: { x: 0, y: 0.02, z: 18 },
        rotationY: Math.PI,
        tint: glow,
        tintStrength: 0.06,
        emissiveBoost: 0.03,
      });
    }

    group.position.set(resolvedPosition.x ?? 0, resolvedPosition.y ?? 0, resolvedPosition.z ?? 0);
    group.rotation.y = rotationY;
    this.scene.add(group);
  }

  buildLights() {
    this.ambient = new THREE.AmbientLight('#d4e7ff', this.theme === 'light' ? 1.65 : 0.6);
    this.sun = new THREE.DirectionalLight('#8fb8ff', this.theme === 'light' ? 1.8 : 1.22);
    this.sun.position.set(54, 84, 34);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.camera.left = -180;
    this.sun.shadow.camera.right = 180;
    this.sun.shadow.camera.top = 180;
    this.sun.shadow.camera.bottom = -180;

    this.rimLight = new THREE.PointLight('#4ce6ff', this.theme === 'light' ? 22 : 38, 240, 2);
    this.rimLight.position.set(0, 38, -14);

    this.scene.add(this.ambient, this.sun, this.rimLight);
  }

  buildGround() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(520, 520), this.materials.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const surfaceOverlay = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 500),
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        map: getDistrictSurfaceTexture(this.theme),
        transparent: true,
        opacity: this.theme === 'light' ? 0.68 : 0.9,
        roughness: 0.92,
        metalness: 0.04,
      }),
    );
    surfaceOverlay.rotation.x = -Math.PI / 2;
    surfaceOverlay.position.y = 0.03;
    surfaceOverlay.receiveShadow = true;
    this.scene.add(surfaceOverlay);

    const underlay = new THREE.Mesh(
      new THREE.CircleGeometry(190, 72),
      new THREE.MeshBasicMaterial({
        color: this.theme === 'light' ? '#dfeafe' : '#0d1830',
        transparent: true,
        opacity: this.theme === 'light' ? 0.22 : 0.38,
      }),
    );
    underlay.rotation.x = -Math.PI / 2;
    underlay.position.y = 0.04;
    this.scene.add(underlay);

    const outerRoad = new THREE.Mesh(
      new THREE.RingGeometry(120, 138, 96),
      new THREE.MeshStandardMaterial({
        color: this.theme === 'light' ? '#d8e5fa' : '#11233b',
        roughness: 0.74,
        metalness: 0.12,
      }),
    );
    outerRoad.rotation.x = -Math.PI / 2;
    outerRoad.position.y = 0.07;
    this.scene.add(outerRoad);

    const innerRoad = new THREE.Mesh(
      new THREE.RingGeometry(52, 68, 80),
      new THREE.MeshStandardMaterial({
        color: this.theme === 'light' ? '#e3eeff' : '#0f2038',
        roughness: 0.68,
        metalness: 0.18,
      }),
    );
    innerRoad.rotation.x = -Math.PI / 2;
    innerRoad.position.y = 0.065;
    this.scene.add(innerRoad);

    const centralAvenues = [
      { width: 28, depth: 184, x: 0, z: 0 },
      { width: 184, depth: 22, x: 0, z: 0 },
      { width: 18, depth: 104, x: -39, z: -6 },
      { width: 18, depth: 104, x: 42, z: -5 },
      { width: 88, depth: 18, x: 0, z: 46 },
      { width: 88, depth: 18, x: 0, z: -48 },
    ];
    centralAvenues.forEach((avenue, avenueIndex) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(avenue.width, 0.14, avenue.depth),
        new THREE.MeshStandardMaterial({
          color: this.theme === 'light' ? '#cfdef5' : '#0b1a2b',
          roughness: 0.78,
          metalness: 0.12,
        }),
      );
      mesh.position.set(avenue.x, 0.09, avenue.z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(
          avenue.width > avenue.depth ? avenue.width * 0.62 : 1.1,
          0.06,
          avenue.width > avenue.depth ? 1.1 : avenue.depth * 0.62,
        ),
        this.materials.emissive(avenueIndex % 2 === 0 ? '#5edfff' : '#72f1d5', this.theme === 'light' ? 0.18 : 0.42),
      );
      strip.position.set(avenue.x, 0.19, avenue.z);
      this.scene.add(strip);
    });

    const laneDashMaterial = new THREE.MeshBasicMaterial({
      color: this.theme === 'light' ? '#86a7d6' : '#9fefff',
      transparent: true,
      opacity: this.theme === 'light' ? 0.36 : 0.56,
    });
    for (let index = -6; index <= 6; index += 1) {
      const verticalDash = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 7.2), laneDashMaterial);
      verticalDash.rotation.x = -Math.PI / 2;
      verticalDash.position.set(0, 0.2, index * 12);
      this.scene.add(verticalDash);

      const horizontalDash = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.3), laneDashMaterial);
      horizontalDash.rotation.x = -Math.PI / 2;
      horizontalDash.position.set(index * 12, 0.2, 0);
      this.scene.add(horizontalDash);
    }

    [-64, 64].forEach((x) => {
      const lane = new THREE.Mesh(
        new THREE.BoxGeometry(24, 0.18, 160),
        new THREE.MeshStandardMaterial({
          color: this.theme === 'light' ? '#cfdef5' : '#102137',
          roughness: 0.72,
          metalness: 0.1,
        }),
      );
      lane.position.set(x, 0.09, 0);
      lane.receiveShadow = true;
      this.scene.add(lane);
    });

    [-74, 74].forEach((z) => {
      const lane = new THREE.Mesh(
        new THREE.BoxGeometry(146, 0.18, 18),
        new THREE.MeshStandardMaterial({
          color: this.theme === 'light' ? '#cfdef5' : '#102137',
          roughness: 0.72,
          metalness: 0.1,
        }),
      );
      lane.position.set(0, 0.09, z);
      lane.receiveShadow = true;
      this.scene.add(lane);
    });

    const grid = new THREE.GridHelper(420, 42, this.materials.palette.border, this.materials.palette.groundSecondary);
    grid.position.y = 0.12;
    grid.material.opacity = this.theme === 'light' ? 0.1 : 0.16;
    grid.material.transparent = true;
    this.scene.add(grid);

    const curbRing = new THREE.Mesh(
      new THREE.RingGeometry(30.8, 33.6, 80),
      new THREE.MeshStandardMaterial({
        color: this.theme === 'light' ? '#f7fbff' : '#16263d',
        roughness: 0.4,
        metalness: 0.18,
      }),
    );
    curbRing.rotation.x = -Math.PI / 2;
    curbRing.position.y = 0.16;
    this.scene.add(curbRing);
  }

  buildSectorPlaza(sector) {
    const group = new THREE.Group();

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(sector.radius, sector.radius + 3.2, 1.4, 48),
      this.materials.platform,
    );
    base.position.set(sector.center.x, 0.7, sector.center.z);
    base.receiveShadow = true;
    base.castShadow = true;
    group.add(base);

    const trim = new THREE.Mesh(
      new THREE.TorusGeometry(sector.radius * 0.82, 0.5, 12, 72),
      this.materials.emissive(sector.accent, this.theme === 'light' ? 0.46 : 0.9),
    );
    trim.rotation.x = Math.PI / 2;
    trim.position.set(sector.center.x, 1.15, sector.center.z);
    group.add(trim);
    this.dockRings.push(trim);

    const innerPad = new THREE.Mesh(
      new THREE.CylinderGeometry(sector.radius * 0.58, sector.radius * 0.62, 0.16, 40),
      new THREE.MeshStandardMaterial({
        color: this.theme === 'light' ? '#f7fbff' : '#14243b',
        roughness: 0.32,
        metalness: 0.38,
      }),
    );
    innerPad.position.set(sector.center.x, 0.9, sector.center.z);
    group.add(innerPad);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(sector.radius * 0.45, 0.34, 10, 48),
      this.materials.emissive(sector.glow, this.theme === 'light' ? 0.28 : 0.58),
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.set(sector.center.x, 1.03, sector.center.z);
    group.add(innerRing);

    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8;
      const radius = sector.radius * 0.48;
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(6.6, 0.2, 2.8),
        new THREE.MeshStandardMaterial({
          color: this.theme === 'light' ? '#edf5ff' : '#10243c',
          roughness: 0.34,
          metalness: 0.32,
        }),
      );
      plate.position.set(
        sector.center.x + Math.cos(angle) * radius,
        1.01,
        sector.center.z + Math.sin(angle) * radius,
      );
      plate.rotation.y = -angle;
      plate.receiveShadow = true;
      plate.castShadow = true;
      group.add(plate);

      const accentStrip = new THREE.Mesh(
        new THREE.PlaneGeometry(4.8, 0.24),
        new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? sector.accent : sector.glow,
          transparent: true,
          opacity: this.theme === 'light' ? 0.4 : 0.68,
        }),
      );
      accentStrip.rotation.x = -Math.PI / 2;
      accentStrip.rotation.z = -angle;
      accentStrip.position.set(
        sector.center.x + Math.cos(angle) * radius,
        1.12,
        sector.center.z + Math.sin(angle) * radius,
      );
      group.add(accentStrip);
    }

    for (let index = 0; index < 6; index += 1) {
      const angle = (Math.PI * 2 * index) / 6;
      const radius = sector.radius * 0.78;
      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(1.6, 2.1, 1.8, 12),
        this.materials.border,
      );
      plinth.position.set(
        sector.center.x + Math.cos(angle) * radius,
        0.92,
        sector.center.z + Math.sin(angle) * radius,
      );
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      group.add(plinth);

      const cap = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.54 + (index % 2) * 0.08),
        this.materials.emissive(index % 2 === 0 ? sector.accent : sector.glow, this.theme === 'light' ? 0.24 : 0.62),
      );
      cap.position.set(
        sector.center.x + Math.cos(angle) * radius,
        2.08,
        sector.center.z + Math.sin(angle) * radius,
      );
      group.add(cap);
      this.orbiters.push({ object: cap, radius: 0, speed: 0.14 + index * 0.01 });
    }

    const sign = createDistrictSign(
      sector.id === 'boot-relay'
        ? 'BOOT RELAY'
        : sector.id === 'firewall-sector'
          ? 'FIREWALL'
          : sector.id === 'routing-array'
            ? 'ROUTING ARRAY'
            : sector.id === 'inference-core'
              ? 'INFERENCE CORE'
              : 'CORE CHAMBER',
      sector.accent,
      sector.id === 'routing-array' ? 18 : 15.5,
      3.9,
    );
    sign.position.set(sector.center.x, 7.6, sector.center.z - sector.radius * 0.72);
    group.add(sign);

    return group;
  }

  async buildSectors({ onProgress } = {}) {
    for (const [index, sector] of SECTORS.entries()) {
      const group = this.buildSectorPlaza(sector);

      if (sector.id === 'boot-relay') {
        const tower = createColumn(this.materials.border, 9.2, 1.2);
        tower.position.set(sector.center.x - 18, 4.8, sector.center.z - 18);
        const cap = new THREE.Mesh(new THREE.OctahedronGeometry(2.2), this.materials.emissive(sector.accent, 1.1));
        cap.position.set(sector.center.x - 18, 10.6, sector.center.z - 18);
        group.add(tower, cap);

        this.addImportedInstance(group, 'crossroadsBase', {
          height: 6.8,
          position: { x: sector.center.x - 20.5, y: 1.02, z: sector.center.z + 12.2 },
          tint: sector.accent,
          tintStrength: 0.1,
          emissiveBoost: 0.08,
          shadow: { width: 12, depth: 10, opacity: 0.18 },
        });
        this.addTexturedFloorShadow(group, 'crossroadsFloorShadow', {
          width: 14.5,
          depth: 14.5,
          position: { x: sector.center.x - 20.5, z: sector.center.z + 12.2 },
          rotation: 0.08,
        });
        this.addImportedInstance(group, 'introBase', {
          height: 4.4,
          rotationY: Math.PI * 0.2,
          position: { x: sector.center.x + 17.6, y: 1.02, z: sector.center.z - 15.2 },
          tint: sector.glow,
          tintStrength: 0.1,
          emissiveBoost: 0.08,
          shadow: { width: 8.5, depth: 7.2, opacity: 0.16 },
        });
        this.addTexturedFloorShadow(group, 'introFloorShadow', {
          width: 10.2,
          depth: 10.2,
          position: { x: sector.center.x + 17.6, z: sector.center.z - 15.2 },
          rotation: -0.04,
        });
        this.addImportedInstance(group, 'arrowKey', {
          height: 2.1,
          rotationY: Math.PI * 0.12,
          position: { x: sector.center.x + 19.6, y: 1.02, z: sector.center.z + 11.4 },
          tint: '#9aefff',
          tintStrength: 0.16,
          emissiveBoost: 0.1,
          shadow: { width: 3.6, depth: 3.2, opacity: 0.14 },
        });
        this.addImportedInstance(group, 'controlLabels', {
          height: 3.2,
          rotationY: Math.PI * 1.5,
          position: { x: sector.center.x - 19.8, y: 1.02, z: sector.center.z - 11.4 },
          tint: '#a8f5ff',
          tintStrength: 0.12,
          emissiveBoost: 0.08,
          shadow: { width: 4.8, depth: 3.8, opacity: 0.14 },
        });
        this.addImportedInstance(group, 'robotExpressive', {
          height: 4.2,
          rotationY: Math.PI * 0.9,
          position: { x: sector.center.x - 12.6, y: 1.02, z: sector.center.z + 19.2 },
          tint: '#79dfff',
          tintStrength: 0.08,
          emissiveBoost: 0.04,
          shadow: { width: 3.4, depth: 2.4, opacity: 0.16 },
        });
        this.createParkedCar({
          position: { x: sector.center.x + 16.4, z: sector.center.z + 4.2 },
          rotationY: -0.62,
          tint: '#48dcff',
          bunny: true,
        });
        this.createParkedCar({
          position: { x: sector.center.x - 6.8, z: sector.center.z - 17.2 },
          rotationY: 0.42,
          tint: '#8ceaff',
        });
        this.createFlowerPatch({ x: sector.center.x - 22, z: sector.center.z + 6 }, 7, '#5ef2e3');

        const servicePosts = [
          { x: -8.4, z: -22 },
          { x: 8.4, z: -22 },
          { x: -8.4, z: 21 },
          { x: 8.4, z: 21 },
        ];
        servicePosts.forEach((item, serviceIndex) => {
          const post = createColumn(this.materials.border, 4.8, 0.46);
          post.position.set(sector.center.x + item.x, 2.4, sector.center.z + item.z);
          group.add(post);

          const halo = new THREE.Mesh(
            new THREE.TorusGeometry(0.74, 0.08, 8, 24),
            this.materials.emissive(serviceIndex % 2 === 0 ? '#5edfff' : '#72f1d5', this.theme === 'light' ? 0.28 : 0.72),
          );
          halo.rotation.x = Math.PI / 2;
          halo.position.set(sector.center.x + item.x, 4.9, sector.center.z + item.z);
          group.add(halo);
        });

        [
          { x: -12, z: -6, tile: 'tileC', tint: '#72f1d5', rot: 0.12 },
          { x: -8, z: 10, tile: 'tileD', tint: '#5edfff', rot: -0.18 },
          { x: 10, z: -8, tile: 'tileB', tint: '#79dfff', rot: 0.28 },
          { x: 13, z: 9, tile: 'tileE', tint: '#8cf4ff', rot: -0.08 },
          { x: 0, z: 17, tile: 'tileA', tint: '#72f1d5', rot: 0 },
        ].forEach((item) => {
          this.addImportedInstance(group, item.tile, {
            height: 1.18,
            rotationY: item.rot,
            position: { x: sector.center.x + item.x, y: 1.04, z: sector.center.z + item.z },
            tint: item.tint,
            tintStrength: 0.14,
            emissiveBoost: 0.08,
            shadow: { width: 2.8, depth: 2.8, opacity: 0.12 },
          });
        });

        const bayBeam = new THREE.Mesh(
          new THREE.BoxGeometry(18, 0.56, 1.2),
          this.materials.emissive('#5edfff', this.theme === 'light' ? 0.3 : 0.8),
        );
        bayBeam.position.set(sector.center.x, 4.6, sector.center.z + 16.8);
        group.add(bayBeam);
      }

      if (sector.id === 'firewall-sector') {
        const gateLeft = createColumn(this.materials.border, 10.5, 1.05);
        gateLeft.position.set(sector.center.x - 12.5, 5.3, sector.center.z + 2);
        const gateRight = createColumn(this.materials.border, 10.5, 1.05);
        gateRight.position.set(sector.center.x + 12.5, 5.3, sector.center.z + 2);
        const gateBeam = new THREE.Mesh(new THREE.BoxGeometry(25.5, 1, 1.2), this.materials.emissive(sector.accent, 1.18));
        gateBeam.position.set(sector.center.x, 9.2, sector.center.z + 2);
        group.add(gateLeft, gateRight, gateBeam);

        this.addImportedInstance(group, 'informationBase', {
          height: 7.8,
          rotationY: Math.PI * 0.18,
          position: { x: sector.center.x - 17.8, y: 1.02, z: sector.center.z - 10.8 },
          tint: sector.accent,
          tintStrength: 0.2,
          emissiveBoost: 0.16,
          shadow: { width: 11.5, depth: 9, opacity: 0.18 },
        });
        this.addTexturedFloorShadow(group, 'informationFloorShadow', {
          width: 12.4,
          depth: 12.4,
          position: { x: sector.center.x - 17.8, z: sector.center.z - 10.8 },
          rotation: -0.02,
        });
        this.addImportedInstance(group, 'distinctionB', {
          height: 5.4,
          rotationY: Math.PI * 0.1,
          position: { x: sector.center.x + 18.8, y: 1.02, z: sector.center.z + 13.2 },
          tint: '#ff9f82',
          tintStrength: 0.22,
          emissiveBoost: 0.2,
          shadow: { width: 7.6, depth: 6, opacity: 0.16 },
        });
        this.addImportedInstance(group, 'awwwardsTrophy', {
          height: 3.5,
          rotationY: Math.PI * 0.12,
          position: { x: sector.center.x + 14.8, y: 1.02, z: sector.center.z - 15.4 },
          tint: '#ff9960',
          tintStrength: 0.2,
          emissiveBoost: 0.14,
          shadow: { width: 3.6, depth: 3.6, opacity: 0.14 },
        });
        this.addImportedInstance(group, 'distinctionAwardA', {
          height: 3.2,
          rotationY: Math.PI,
          position: { x: sector.center.x - 3.4, y: 1.02, z: sector.center.z + 18.2 },
          tint: '#ffcf86',
          tintStrength: 0.18,
          emissiveBoost: 0.12,
          shadow: { width: 3.2, depth: 3.2, opacity: 0.14 },
        });
        this.addImportedInstance(group, 'robotExpressive', {
          height: 4.2,
          rotationY: Math.PI * 1.1,
          position: { x: sector.center.x - 12.4, y: 1.02, z: sector.center.z + 17.2 },
          tint: '#ffc3a6',
          tintStrength: 0.08,
          emissiveBoost: 0.04,
          shadow: { width: 3.4, depth: 2.4, opacity: 0.16 },
        });
        this.createParkedCar({
          position: { x: sector.center.x + 16.2, z: sector.center.z + 2.8 },
          rotationY: 0.45,
          tint: '#ff7a5f',
        });
      }

      if (sector.id === 'routing-array') {
        for (const offset of [-14, 0, 14]) {
          const tower = createColumn(this.materials.neutral, 9.2, 0.92);
          tower.position.set(sector.center.x + offset, 4.8, sector.center.z - 11.4);
          group.add(tower);
        }
        const bridge = createBridge(this.materials.glass, 24, 6.8);
        bridge.position.set(sector.center.x + 9, 3.1, sector.center.z + 1.2);
        group.add(bridge);

        this.addImportedInstance(group, 'playgroundBase', {
          height: 7.2,
          rotationY: Math.PI * 0.24,
          position: { x: sector.center.x + 18.4, y: 1.02, z: sector.center.z - 9.8 },
          tint: sector.accent,
          tintStrength: 0.18,
          emissiveBoost: 0.12,
          shadow: { width: 12.6, depth: 9.4, opacity: 0.18 },
        });
        this.addTexturedFloorShadow(group, 'playgroundFloorShadow', {
          width: 12.8,
          depth: 12.8,
          position: { x: sector.center.x + 18.4, z: sector.center.z - 9.8 },
          rotation: 0.06,
        });
        this.addImportedInstance(group, 'distinctionC', {
          height: 5.2,
          rotationY: Math.PI * 1.1,
          position: { x: sector.center.x - 18.6, y: 1.02, z: sector.center.z + 11.2 },
          tint: '#85d5ff',
          tintStrength: 0.2,
          emissiveBoost: 0.16,
          shadow: { width: 7.2, depth: 6.4, opacity: 0.16 },
        });
        this.addImportedInstance(group, 'laptop', {
          height: 2.3,
          rotationY: Math.PI * 1.45,
          position: { x: sector.center.x - 4.8, y: 1.02, z: sector.center.z + 18.2 },
          tint: '#5bc8ff',
          tintStrength: 0.12,
          emissiveBoost: 0.08,
          shadow: { width: 4.4, depth: 3.6, opacity: 0.14 },
        });
        this.addImportedInstance(group, 'distinctionAwardB', {
          height: 3.1,
          rotationY: Math.PI * 0.1,
          position: { x: sector.center.x + 4.6, y: 1.02, z: sector.center.z - 17.8 },
          tint: '#a7edff',
          tintStrength: 0.14,
          emissiveBoost: 0.08,
          shadow: { width: 3.2, depth: 3.2, opacity: 0.14 },
        });
        this.addImportedInstance(group, 'robotExpressive', {
          height: 4.1,
          rotationY: Math.PI * 1.5,
          position: { x: sector.center.x + 15.8, y: 1.02, z: sector.center.z + 15.8 },
          tint: '#8ad9ff',
          tintStrength: 0.08,
          emissiveBoost: 0.04,
          shadow: { width: 3.4, depth: 2.4, opacity: 0.16 },
        });
        this.createParkedCar({
          position: { x: sector.center.x - 14.4, z: sector.center.z - 15.4 },
          rotationY: -0.42,
          tint: '#61c9ff',
        });
      }

      if (sector.id === 'inference-core') {
        const orb = new THREE.Mesh(new THREE.SphereGeometry(3.6, 22, 22), this.materials.emissive(sector.accent, 1.2));
        orb.position.set(sector.center.x, 8.6, sector.center.z);
        group.add(orb);
        this.orbiters.push({ object: orb, radius: 0, speed: 0.4 });

        for (let index = 0; index < 4; index += 1) {
          const node = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 0), this.materials.emissive(sector.glow, 1));
          node.position.set(
            sector.center.x + Math.cos((Math.PI * 2 * index) / 4) * 9.6,
            6.6,
            sector.center.z + Math.sin((Math.PI * 2 * index) / 4) * 9.6,
          );
          group.add(node);
          this.orbiters.push({ object: node, center: sector.center, radius: 9.6 + index, speed: 0.5 + index * 0.12, angle: index });
        }

        this.addImportedInstance(group, 'distinctionA', {
          height: 5.8,
          rotationY: Math.PI * 0.34,
          position: { x: sector.center.x - 19.8, y: 1.02, z: sector.center.z + 8.8 },
          tint: sector.accent,
          tintStrength: 0.2,
          emissiveBoost: 0.16,
          shadow: { width: 7.8, depth: 6.2, opacity: 0.16 },
        });
        this.addImportedInstance(group, 'distinctionC', {
          height: 5.1,
          rotationY: Math.PI * 1.2,
          position: { x: sector.center.x + 18.4, y: 1.02, z: sector.center.z - 10.8 },
          tint: sector.glow,
          tintStrength: 0.18,
          emissiveBoost: 0.16,
          shadow: { width: 6.8, depth: 5.8, opacity: 0.16 },
        });
        this.addImportedInstance(group, 'webbyTrophy', {
          height: 3.4,
          rotationY: Math.PI * 0.24,
          position: { x: sector.center.x + 10.8, y: 1.02, z: sector.center.z + 18.4 },
          tint: '#dcb4ff',
          tintStrength: 0.18,
          emissiveBoost: 0.14,
          shadow: { width: 3.4, depth: 3.4, opacity: 0.14 },
        });
        this.addImportedInstance(group, 'robotExpressive', {
          height: 4.3,
          rotationY: Math.PI * 0.1,
          position: { x: sector.center.x - 13.8, y: 1.02, z: sector.center.z - 16.8 },
          tint: '#ceb3ff',
          tintStrength: 0.08,
          emissiveBoost: 0.04,
          shadow: { width: 3.4, depth: 2.4, opacity: 0.16 },
        });
        this.createFlowerPatch({ x: sector.center.x - 16.5, z: sector.center.z - 11.2 }, 8, '#c8a4ff');
      }

      if (sector.id === 'core-chamber') {
        const coreRing = new THREE.Mesh(
          new THREE.TorusKnotGeometry(5.5, 0.9, 96, 16),
          this.materials.emissive(sector.glow, 1.12),
        );
        coreRing.position.set(sector.center.x, 8.8, sector.center.z - 1.8);
        group.add(coreRing);
        this.orbiters.push({ object: coreRing, radius: 0, speed: 0.34 });

        this.addImportedInstance(group, 'laptop', {
          height: 3.4,
          rotationY: Math.PI,
          position: { x: sector.center.x + 14.6, y: 1.04, z: sector.center.z - 11.8 },
          tint: '#ffd166',
          tintStrength: 0.14,
          emissiveBoost: 0.1,
          shadow: { width: 6.2, depth: 5.2, opacity: 0.16 },
        });
        this.addImportedInstance(group, 'distinctionA', {
          height: 5.2,
          rotationY: Math.PI * 0.86,
          position: { x: sector.center.x - 15.6, y: 1.02, z: sector.center.z + 10.4 },
          tint: sector.glow,
          tintStrength: 0.18,
          emissiveBoost: 0.16,
          shadow: { width: 7, depth: 5.8, opacity: 0.16 },
        });
        this.addImportedInstance(group, 'distinctionB', {
          height: 5.2,
          rotationY: Math.PI * 0.2,
          position: { x: sector.center.x + 15.6, y: 1.02, z: sector.center.z + 10.4 },
          tint: sector.glow,
          tintStrength: 0.18,
          emissiveBoost: 0.16,
          shadow: { width: 7, depth: 5.8, opacity: 0.16 },
        });
        this.addImportedInstance(group, 'distinctionAwardC', {
          height: 3.3,
          rotationY: Math.PI * 0.3,
          position: { x: sector.center.x - 13.2, y: 1.02, z: sector.center.z - 14.8 },
          tint: '#ffe490',
          tintStrength: 0.18,
          emissiveBoost: 0.14,
          shadow: { width: 3.4, depth: 3.4, opacity: 0.14 },
        });
        this.addImportedInstance(group, 'robotExpressive', {
          height: 4.1,
          rotationY: Math.PI,
          position: { x: sector.center.x + 17.6, y: 1.02, z: sector.center.z + 2.4 },
          tint: '#ffe4a1',
          tintStrength: 0.06,
          emissiveBoost: 0.03,
          shadow: { width: 3.4, depth: 2.4, opacity: 0.16 },
        });
      }

      this.sectorMeshes.set(sector.id, group);
      this.scene.add(group);
      onProgress?.((index + 1) / SECTORS.length);
      await nextFrame();
    }
  }

  async buildCorridors({ onProgress } = {}) {
    const corridors = [
      { x: -39, z: -6, width: 34, depth: 10, rotation: 0.1, tile: 'tileD' },
      { x: 42, z: -5, width: 34, depth: 10, rotation: -0.1, tile: 'tileD' },
      { x: 0, z: 46, width: 10, depth: 44, rotation: 0, tile: 'tileE' },
      { x: 0, z: -48, width: 10, depth: 44, rotation: 0, tile: 'tileE' },
    ];

    for (const [index, corridor] of corridors.entries()) {
      const mesh = createBridge(this.materials.border, corridor.width, corridor.depth);
      mesh.position.set(corridor.x, 0.9, corridor.z);
      mesh.rotation.y = corridor.rotation;
      this.scene.add(mesh);

       const alongX = corridor.depth > corridor.width;
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(
          alongX ? 1.4 : corridor.width * 0.78,
          0.08,
          alongX ? corridor.depth * 0.78 : 1.4,
        ),
        this.materials.emissive(alongX ? '#72f1d5' : '#5cbcff', this.theme === 'light' ? 0.36 : 0.72),
      );
      strip.position.set(corridor.x, 1.54, corridor.z);
      strip.rotation.y = corridor.rotation;
      this.scene.add(strip);

      [-1, 1].forEach((side) => {
        for (let index = -2; index <= 2; index += 1) {
          const post = createColumn(this.materials.border, 2.8, 0.22);
          post.position.set(
            corridor.x + (alongX ? side * 3.8 : index * 6.1),
            2.3,
            corridor.z + (alongX ? index * 6.1 : side * 3.8),
          );
          post.rotation.y = corridor.rotation;
          this.scene.add(post);

          const cap = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.4, 0),
            this.materials.emissive(alongX ? '#72f1d5' : '#5cbcff', this.theme === 'light' ? 0.38 : 0.82),
          );
          cap.position.copy(post.position);
          cap.position.y += 1.8;
          this.scene.add(cap);
          this.orbiters.push({ object: cap, radius: 0, speed: 0.12 + (index + 2) * 0.02 });
        }
      });

      for (let index = -4; index <= 4; index += 1) {
        this.addImportedInstance(this.scene, corridor.tile, {
          height: 0.78,
          rotationY: corridor.rotation,
          position: {
            x: corridor.x + (alongX ? index * 1.9 : 0),
            y: 1.14,
            z: corridor.z + (alongX ? 0 : index * 1.9),
          },
          tint: this.theme === 'light' ? '#bfd0ee' : '#233859',
          tintStrength: 0.08,
          emissiveBoost: 0.04,
        });
      }
      onProgress?.((index + 1) / corridors.length);
      await nextFrame();
    }
  }

  async buildInteractables({ onProgress } = {}) {
    const addDock = (id, position, sectorId) => {
      const dock = createPad(this.materials.platform, this.materials.emissive('#46e0ff', 1.14), 4.2);
      const shadow = createGroundShadow(6.8, 6.8, this.theme === 'light' ? 0.1 : 0.18);
      this.groundShadows.push(shadow);
      dock.add(shadow);
      dock.position.set(position.x, 0.2, position.z);
      this.addImportedInstance(dock, 'tileA', {
        height: 0.62,
        position: { x: 0, y: 0.32, z: 0 },
        tint: '#46e0ff',
        tintStrength: 0.12,
        emissiveBoost: 0.06,
      });
      this.registerInteractable({ id, type: 'dock', position, sectorId, object: dock, tint: '#46e0ff' });
    };

    const addBeacon = (item, type, sectorId, color) => {
      const object = createBeacon(this.materials.neutral, this.materials.emissive(color, 1.16));
      const shadow = createGroundShadow(4.8, 4.8, this.theme === 'light' ? 0.1 : 0.18);
      this.groundShadows.push(shadow);
      object.add(shadow);
      object.position.set(item.x, 0, item.z);
      this.addImportedInstance(object, 'cone', {
        height: 2.9,
        position: { x: 0, y: 0.02, z: 0 },
        tint: color,
        tintStrength: 0.12,
        emissiveBoost: 0.1,
      });
      this.addImportedInstance(object, 'tileB', {
        height: 0.48,
        position: { x: 0, y: 0.2, z: 0 },
        tint: color,
        tintStrength: 0.08,
        emissiveBoost: 0.04,
      });
      this.registerInteractable({ ...item, type, sectorId, position: { x: item.x, z: item.z }, object, tint: color });
    };

    const addPanel = (item, type, sectorId, color) => {
      const object = this.assets?.boardStructure
        ? new THREE.Group()
        : createHoloPanel(this.materials.border, this.materials.emissive(color, 1.18));
      const shadow = createGroundShadow(5.4, 4.2, this.theme === 'light' ? 0.1 : 0.18);
      this.groundShadows.push(shadow);
      object.add(shadow);
      object.position.set(item.x, 0, item.z);

      if (this.assets?.boardStructure) {
        this.addImportedInstance(object, 'boardStructure', {
          height: 4.2,
          tint: color,
          tintStrength: 0.1,
          emissiveBoost: 0.06,
        });
        this.addImportedInstance(object, 'boardPlane', {
          height: 2.5,
          rotationY: Math.PI,
          position: { x: 0, y: 2.18, z: 0.54 },
          tint: color,
          tintStrength: 0.18,
          emissiveBoost: 0.22,
        });
        const glow = new THREE.Mesh(
          new THREE.PlaneGeometry(4.4, 2.2),
          this.materials.emissive(color, 1.08),
        );
        glow.position.set(0, 2.18, 0.68);
        object.add(glow);
      }

      this.registerInteractable({ ...item, type, sectorId, position: { x: item.x, z: item.z }, object, tint: color });
    };

    const phases = [
      () => {
        addBeacon({ id: 'boot-beacon', ...WORLD_LAYOUT.boot.bootBeacon }, 'boot-beacon', 'boot-relay', '#3cf5d2');
        addDock('boot-dock', WORLD_LAYOUT.boot.dock, 'boot-relay');
      },
      () => {
        addDock('firewall-dock', WORLD_LAYOUT.firewall.dock, 'firewall-sector');
        WORLD_LAYOUT.firewall.beacons.forEach((item) => addBeacon(item, 'security-beacon', 'firewall-sector', '#ff764a'));
        WORLD_LAYOUT.firewall.shards.forEach((item) => addBeacon(item, 'security-shard', 'firewall-sector', '#ffb703'));
        WORLD_LAYOUT.firewall.nodes.forEach((item) => addPanel(item, 'security-node', 'firewall-sector', '#ff4d6d'));
      },
      () => {
        addDock('routing-dock', WORLD_LAYOUT.routing.dock, 'routing-array');
        WORLD_LAYOUT.routing.towers.forEach((item) => addBeacon(item, 'routing-tower', 'routing-array', '#39a7ff'));
        WORLD_LAYOUT.routing.switches.forEach((item) => addPanel(item, 'routing-switch', 'routing-array', '#9ad7ff'));
      },
      () => {
        addDock('inference-dock', WORLD_LAYOUT.inference.dock, 'inference-core');
        WORLD_LAYOUT.inference.seeds.forEach((item) => addBeacon(item, 'inference-seed', 'inference-core', '#b06cff'));
        WORLD_LAYOUT.inference.terminals.forEach((item) => addPanel(item, 'inference-terminal', 'inference-core', '#d3adff'));
      },
      () => {
        addDock('core-dock', WORLD_LAYOUT.core.dock, 'core-chamber');
        WORLD_LAYOUT.core.pylons.forEach((item) => addBeacon(item, 'core-pylon', 'core-chamber', '#ffd166'));
        addPanel(WORLD_LAYOUT.core.console, 'core-console', 'core-chamber', '#ffe28f');
        WORLD_LAYOUT.firewall.lasers.forEach((laser) => {
          const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(laser.axis === 'x' ? 18 : 1, 1, laser.axis === 'z' ? 18 : 1),
            this.materials.emissive('#ff385c', 1.22),
          );
          mesh.position.set(laser.anchor.x, 0.9, laser.anchor.z);
          this.hazards.push({ ...laser, object: mesh, position: { x: laser.anchor.x, z: laser.anchor.z } });
          this.scene.add(mesh);
        });
      },
    ];

    for (const [index, phase] of phases.entries()) {
      phase();
      onProgress?.((index + 1) / phases.length);
      await nextFrame();
    }
  }

  async buildScenery({ onProgress } = {}) {
    const profile = this.worldProfile;
    const perimeter = [
      [-124, -50], [-118, 14], [-108, 58], [-80, 102], [-20, 128], [36, 126], [104, 98], [122, 38], [118, -34], [84, -112], [22, -126], [-34, -122], [-108, -92],
    ].filter((_, index) => index % profile.perimeterStep === 0);
    const parkedCars = [
      { x: -104, z: -52, r: -0.8, tint: '#67c9ff' },
      { x: -92, z: 48, r: -0.24, tint: '#7ef8bb' },
      { x: 96, z: 52, r: 0.32, tint: '#89d7ff' },
      { x: 108, z: -34, r: 0.68, tint: '#ff8e71' },
      { x: 18, z: 110, r: 1.6, tint: '#bb87ff' },
      { x: -18, z: -116, r: Math.PI, tint: '#ffd166' },
    ].slice(0, profile.parkedCars);
    const flowerPatches = [
      { x: -95, z: -32, tint: '#ff9a8b' },
      { x: -78, z: 22, tint: '#ffc167' },
      { x: 92, z: 22, tint: '#85dbff' },
      { x: 110, z: -30, tint: '#82dcff' },
      { x: 14, z: 100, tint: '#d6aaff' },
      { x: -16, z: -106, tint: '#ffe490' },
    ].slice(0, Math.max(4, profile.parkedCars));
    const districts = [
      { x: -154, z: -6, rotationY: Math.PI * 0.5, accent: '#69d2ff', glow: '#d5f2ff' },
      { x: 154, z: 8, rotationY: -Math.PI * 0.5, accent: '#ff9968', glow: '#ffe1ba' },
      { x: -18, z: 154, rotationY: Math.PI, accent: '#b891ff', glow: '#e2d4ff' },
      { x: 8, z: -156, rotationY: 0, accent: '#72f1d5', glow: '#d9fff2' },
    ].slice(0, profile.backdropDistricts);
    const sceneryPhases = [];

    sceneryPhases.push(() => {
      this.addImportedInstance(this.scene, 'mountainLandscape', {
        height: 42,
        rotationY: Math.PI * 0.12,
        position: { x: 0, y: 0.08, z: 168 },
        tint: this.theme === 'light' ? '#98b7dd' : '#243e63',
        tintStrength: this.theme === 'light' ? 0.18 : 0.28,
        emissiveBoost: 0.02,
        shadow: { width: 110, depth: 42, opacity: this.theme === 'light' ? 0.05 : 0.12 },
      });

      this.addImportedInstance(this.scene, 'cityBlock', {
        height: 34,
        rotationY: Math.PI * 1.02,
        position: { x: 132, y: 0.08, z: -110 },
        tint: this.theme === 'light' ? '#9bb7de' : '#27486d',
        tintStrength: this.theme === 'light' ? 0.18 : 0.24,
        emissiveBoost: 0.04,
        shadow: { width: 68, depth: 44, opacity: this.theme === 'light' ? 0.05 : 0.12 },
      });

      this.addImportedInstance(this.scene, 'cityBlock', {
        height: 31,
        rotationY: Math.PI * 0.18,
        position: { x: -138, y: 0.08, z: -96 },
        tint: this.theme === 'light' ? '#a1bee2' : '#223f61',
        tintStrength: this.theme === 'light' ? 0.16 : 0.24,
        emissiveBoost: 0.03,
        shadow: { width: 62, depth: 40, opacity: this.theme === 'light' ? 0.05 : 0.1 },
      });
    });

    sceneryPhases.push(() => {
      perimeter.forEach(([x, z], index) => {
        const height = 8 + (index % 5) * 2.4;
        const tower = createColumn(this.materials.border, height, 0.9 + (index % 3) * 0.18);
        tower.position.set(x, height / 2, z);
        this.scene.add(tower);

        const top = new THREE.Mesh(
          new THREE.IcosahedronGeometry(1 + (index % 2) * 0.3),
          this.materials.emissive(index % 2 === 0 ? '#5edfff' : '#9b8cff', 0.78),
        );
        top.position.set(x, height + 0.6, z);
        this.scene.add(top);
        this.orbiters.push({ object: top, radius: 0, speed: 0.2 + (index % 4) * 0.05 });

        if (index < perimeter.length - 1) {
          const [nextX, nextZ] = perimeter[index + 1];
          const distance = Math.hypot(nextX - x, nextZ - z);
          if (distance < 72) {
            const span = new THREE.Mesh(
              new THREE.BoxGeometry(distance, 0.54, 2.4),
              new THREE.MeshStandardMaterial({
                color: this.theme === 'light' ? '#d9e7fb' : '#11253c',
                roughness: 0.6,
                metalness: 0.22,
              }),
            );
            span.position.set((x + nextX) / 2, 4.4, (z + nextZ) / 2);
            span.lookAt(nextX, 4.4, nextZ);
            span.rotateY(Math.PI / 2);
            span.castShadow = true;
            span.receiveShadow = true;
            this.scene.add(span);
          }
        }
      });
    });

    sceneryPhases.push(() => {
      parkedCars.forEach((car, index) => {
        this.createParkedCar({
          position: { x: car.x, z: car.z },
          rotationY: car.r,
          tint: car.tint,
          bunny: index % 3 === 0,
        });
      });
    });

    sceneryPhases.push(() => {
      flowerPatches.forEach((patch) => {
        this.createFlowerPatch({ x: patch.x, z: patch.z }, 6, patch.tint);
      });
    });

    sceneryPhases.push(() => {
      const roadsideCount = this.worldProfile.roadsideColumns;
      for (let index = 0; index < roadsideCount; index += 1) {
        const angle = (Math.PI * 2 * index) / roadsideCount;
        const radius = 92 + (index % 4) * 14;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = 4.8 + (index % 3) * 1.6;
        const post = createColumn(this.materials.border, height, 0.34 + (index % 2) * 0.06);
        post.position.set(x, height / 2, z);
        this.scene.add(post);

        const halo = new THREE.Mesh(
          new THREE.TorusGeometry(0.64, 0.08, 8, 24),
          this.materials.emissive(index % 2 === 0 ? '#5edfff' : '#ff9f82', this.theme === 'light' ? 0.22 : 0.58),
        );
        halo.position.set(x, height + 0.36, z);
        halo.rotation.x = Math.PI / 2;
        this.scene.add(halo);
      }
    });

    sceneryPhases.push(() => {
      const markerCount = this.worldProfile.plazaMarkers;
      for (let index = 0; index < markerCount; index += 1) {
        const angle = (Math.PI * 2 * index) / markerCount;
        const radius = 24 + (index % 2) * 2.8;
        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(3.8, 0.18, 1.2),
          new THREE.MeshStandardMaterial({
            color: this.theme === 'light' ? '#ecf4ff' : '#10253d',
            roughness: 0.36,
            metalness: 0.34,
          }),
        );
        panel.position.set(Math.cos(angle) * radius, 0.18, Math.sin(angle) * radius);
        panel.rotation.y = -angle;
        this.scene.add(panel);

        const line = new THREE.Mesh(
          new THREE.PlaneGeometry(3.2, 0.32),
          new THREE.MeshBasicMaterial({
            color: index % 2 === 0 ? '#5edfff' : '#72f1d5',
            transparent: true,
            opacity: this.theme === 'light' ? 0.48 : 0.74,
          }),
        );
        line.rotation.x = -Math.PI / 2;
        line.position.set(Math.cos(angle) * radius, 0.28, Math.sin(angle) * radius);
        line.rotation.z = -angle;
        this.scene.add(line);
      }
    });

    districts.forEach((district) => {
      sceneryPhases.push(() => {
        this.createBackdropDistrict(district);
      });
    });

    sceneryPhases.push(() => {
      for (let index = 0; index < profile.ambientSparks; index += 1) {
        const spark = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.55 + (index % 2) * 0.2),
          this.materials.emissive(index % 2 === 0 ? '#5edfff' : '#9d6dff', 0.74),
        );
        const angle = (Math.PI * 2 * index) / profile.ambientSparks;
        const radius = 46 + (index % 5) * 20;
        spark.position.set(Math.cos(angle) * radius, 3 + (index % 4) * 3.2, Math.sin(angle) * radius);
        this.orbiters.push({ object: spark, radius, speed: 0.15 + (index % 4) * 0.04, angle });
        this.scene.add(spark);
      }
    });

    for (const [index, phase] of sceneryPhases.entries()) {
      phase();
      onProgress?.((index + 1) / sceneryPhases.length);
      await nextFrame();
    }
  }

  buildFocusHelpers() {
    this.focusRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.7, 0.16, 8, 48),
      this.materials.emissive('#46e0ff', this.theme === 'light' ? 0.52 : 1.02),
    );
    this.focusRing.rotation.x = Math.PI / 2;
    this.focusRing.visible = false;

    this.focusBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.48, 6.4, 10),
      new THREE.MeshBasicMaterial({
        color: this.theme === 'light' ? '#1476db' : '#46e0ff',
        transparent: true,
        opacity: this.theme === 'light' ? 0.16 : 0.22,
      }),
    );
    this.focusBeam.visible = false;
    this.scene.add(this.focusRing, this.focusBeam);
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

  setFocusedInteractable(id = null) {
    this.focusedInteractableId = id;
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
      tintObject(item.object, this.theme === 'light' ? '#8ea0bf' : '#44546f', 0.24);
      return;
    }
    if (state === 'complete') {
      item.active = true;
      tintObject(item.object, '#3cf5d2', 1.34);
      return;
    }
    if (state === 'warning') {
      tintObject(item.object, '#ff4d6d', 1.44);
      return;
    }
    if (state === 'idle') {
      item.object.visible = true;
      item.active = true;
      if (item.tint) tintObject(item.object, item.tint, 1.04);
    }
  }

  applyTheme(theme = 'dark') {
    this.theme = theme;
    const palette = getPalette(theme);
    this.scene.background = new THREE.Color(palette.background);
    this.scene.fog = new THREE.Fog(palette.fog, 76, 260);
    if (this.ambient) this.ambient.intensity = theme === 'light' ? 1.65 : 0.6;
    if (this.sun) {
      this.sun.intensity = theme === 'light' ? 1.8 : 1.22;
      this.sun.color.set(theme === 'light' ? '#8aa5ff' : '#9cc8ff');
    }
    if (this.rimLight) {
      this.rimLight.intensity = theme === 'light' ? 18 : 38;
      this.rimLight.color.set(theme === 'light' ? '#3d8bff' : '#4ce6ff');
    }
    if (this.focusBeam?.material) {
      this.focusBeam.material.color.set(theme === 'light' ? '#1476db' : '#46e0ff');
      this.focusBeam.material.opacity = theme === 'light' ? 0.16 : 0.22;
    }
    if (this.materials?.ground) this.materials.ground.color.set(palette.ground);
    if (this.materials?.platform) this.materials.platform.color.set(palette.platform);
    if (this.materials?.border) this.materials.border.color.set(palette.border);
    if (this.materials?.neutral) this.materials.neutral.color.set(palette.neutral);
    if (this.materials?.glass) this.materials.glass.color.set(palette.groundSecondary);
    this.importedInstances.forEach((object) => {
      const tint = object.userData.themeTint;
      if (!tint) return;
      tintImportedModel(
        object,
        tint,
        theme === 'light'
          ? Math.max(0.08, (object.userData.themeTintStrength ?? 0.16) * 0.72)
          : object.userData.themeTintStrength ?? 0.16,
        theme === 'light'
          ? Math.max(0.04, (object.userData.themeEmissiveBoost ?? 0.1) * 0.62)
          : object.userData.themeEmissiveBoost ?? 0.1,
      );
    });
    this.groundShadows.forEach((shadow) => {
      if (!shadow.material) return;
      if (shadow.userData.isTexturedFloorShadow) {
        shadow.material.color.set('#ffffff');
        shadow.material.opacity = theme === 'light' ? 0.34 : 0.66;
        return;
      }
      shadow.material.color.set(theme === 'light' ? '#607594' : '#02060c');
      shadow.material.opacity = theme === 'light' ? 0.1 : 0.18;
    });
  }

  resize() {
    const viewport = getViewportMetrics(globalThis, this.canvas);
    this.renderer?.setSize(viewport.width, viewport.height, false);
  }

  update(dt, elapsed = 0) {
    for (const ring of this.dockRings) {
      ring.rotation.z += dt * 0.26;
      ring.position.y = 1.15 + Math.sin(elapsed * 1.06 + ring.position.x * 0.02) * 0.08;
    }

    for (const orbiter of this.orbiters) {
      orbiter.angle = (orbiter.angle || 0) + dt * orbiter.speed;
      if (orbiter.center) {
        orbiter.object.position.x = orbiter.center.x + Math.cos(orbiter.angle) * orbiter.radius;
        orbiter.object.position.z = orbiter.center.z + Math.sin(orbiter.angle) * orbiter.radius;
        orbiter.object.position.y = 6.6 + Math.sin(orbiter.angle * 1.6) * 1.9;
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

    const focusItem = this.focusedInteractableId ? this.interactableById.get(this.focusedInteractableId) : null;
    if (focusItem?.object?.visible) {
      const pos = worldPosFromObject(focusItem.object);
      this.focusRing.visible = true;
      this.focusBeam.visible = true;
      this.focusRing.position.set(pos.x, 0.3, pos.z);
      this.focusRing.rotation.z += dt * 1.2;
      this.focusBeam.position.set(pos.x, 3.8 + Math.sin(elapsed * 3.2) * 0.2, pos.z);
    } else {
      this.focusRing.visible = false;
      this.focusBeam.visible = false;
    }
  }

  render(camera) {
    this.renderer.render(this.scene, camera);
  }
}
