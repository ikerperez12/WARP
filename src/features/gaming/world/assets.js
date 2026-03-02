import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const REQUIRED_MODEL_MANIFEST = {
  cybertruckChassis: '/gaming-assets/folio2019/vehicles/cybertruck/chassis.glb',
  cybertruckWheel: '/gaming-assets/folio2019/vehicles/cybertruck/wheel.glb',
  cybertruckAntenna: '/gaming-assets/folio2019/vehicles/cybertruck/antena.glb',
  cybertruckBrake: '/gaming-assets/folio2019/vehicles/cybertruck/backLightsBrake.glb',
  defaultCarChassis: '/gaming-assets/folio2019/vehicles/default/chassis.glb',
  defaultCarWheel: '/gaming-assets/folio2019/vehicles/default/wheel.glb',
  defaultCarAntenna: '/gaming-assets/folio2019/vehicles/default/antena.glb',
  defaultCarBrake: '/gaming-assets/folio2019/vehicles/default/backLightsBrake.glb',
  defaultCarBunnyEarLeft: '/gaming-assets/folio2019/vehicles/default/bunnyEarLeft.glb',
  defaultCarBunnyEarRight: '/gaming-assets/folio2019/vehicles/default/bunnyEarRight.glb',
  crossroadsBase: '/gaming-assets/folio2019/structures/crossroads-base.glb',
  playgroundBase: '/gaming-assets/folio2019/structures/playground-base.glb',
  informationBase: '/gaming-assets/folio2019/structures/information-base.glb',
  introBase: '/gaming-assets/folio2019/structures/intro-base.glb',
  distinctionA: '/gaming-assets/folio2019/structures/distinction-a.glb',
  distinctionB: '/gaming-assets/folio2019/structures/distinction-b.glb',
  distinctionC: '/gaming-assets/folio2019/structures/distinction-c.glb',
  boardStructure: '/gaming-assets/folio2019/props/board-structure.glb',
  boardPlane: '/gaming-assets/folio2019/props/board-plane.glb',
  cone: '/gaming-assets/folio2019/props/cone.glb',
  brick: '/gaming-assets/folio2019/props/brick.glb',
  tileA: '/gaming-assets/folio2019/props/tile-a.glb',
  tileB: '/gaming-assets/folio2019/props/tile-b.glb',
  tileC: '/gaming-assets/folio2019/props/tile-c.glb',
  tileD: '/gaming-assets/folio2019/props/tile-d.glb',
  tileE: '/gaming-assets/folio2019/props/tile-e.glb',
  webbyTrophy: '/gaming-assets/folio2019/props/webby-trophy.glb',
  awwwardsTrophy: '/gaming-assets/folio2019/props/awwwards-trophy.glb',
  distinctionAwardA: '/gaming-assets/folio2019/props/distinctions/awwwards.glb',
  distinctionAwardB: '/gaming-assets/folio2019/props/distinctions/cssda.glb',
  distinctionAwardC: '/gaming-assets/folio2019/props/distinctions/fwa.glb',
  arrowKey: '/gaming-assets/folio2019/ui/arrow-key.glb',
  controlLabels: '/gaming-assets/folio2019/ui/control-labels.glb',
};

const OPTIONAL_MODEL_MANIFEST = {
  robotExpressive: '/gaming-assets/open/robot/RobotExpressive.glb',
  kenneyFlower: '/gaming-assets/open/nature/Flower.glb',
  cityBlock: '/gaming-assets/open/city-block/scene.gltf',
  mountainLandscape: '/gaming-assets/open/mountain-landscape/scene.gltf',
  laptop: '/laptop.glb',
};

const TEXTURE_MANIFEST = {
  crossroadsFloorShadow: '/gaming-assets/folio2019/floor-shadows/crossroads-floorShadow.png',
  informationFloorShadow: '/gaming-assets/folio2019/floor-shadows/information-floorShadow.png',
  introFloorShadow: '/gaming-assets/folio2019/floor-shadows/intro-floorShadow.png',
  playgroundFloorShadow: '/gaming-assets/folio2019/floor-shadows/playground-floorShadow.png',
};

let assetPromise;
let assetCache = null;

function withTimeout(promise, label, timeoutMs) {
  let timer = null;
  return Promise.race([
    promise.finally(() => {
      if (timer) window.clearTimeout(timer);
    }),
    new Promise((_, reject) => {
      timer = window.setTimeout(() => {
        reject(new Error(`Timed out loading ${label} after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

async function loadManifestEntries(entries, loader, timeoutMs) {
  return Promise.allSettled(entries.map(async ([key, path]) => {
    const asset = await withTimeout(loader(path), path, timeoutMs);
    return [key, asset];
  }));
}

function collectFulfilledEntries(results) {
  return results.flatMap((result) => {
    if (result.status === 'fulfilled') return [result.value];
    console.warn('[gaming-assets] Failed to load asset', result.reason);
    return [];
  });
}

function cloneMaterial(material) {
  if (!material) return material;
  const next = material.clone ? material.clone() : material;
  if ('color' in next && next.color) {
    next.userData.baseColor = next.color.getHex();
  }
  if ('emissive' in next && next.emissive) {
    next.userData.baseEmissive = next.emissive.getHex();
  }
  return next;
}

function cloneAssetScene(asset) {
  const scene = SkeletonUtils.clone(asset.scene);
  scene.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => cloneMaterial(material));
      return;
    }
    child.material = cloneMaterial(child.material);
  });
  return scene;
}

export function tintImportedModel(object, color, strength = 0.48, emissiveBoost = 0.22) {
  const tint = new THREE.Color(color);
  object.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (!('color' in material) || !material.color) return;
      if (typeof material.userData?.baseColor === 'number') {
        material.color.setHex(material.userData.baseColor);
      }
      material.color.lerp(tint, strength);
      if ('emissive' in material && material.emissive) {
        if (typeof material.userData?.baseEmissive === 'number') {
          material.emissive.setHex(material.userData.baseEmissive);
        }
        material.emissive.lerp(tint, emissiveBoost);
        material.emissiveIntensity = Math.max(material.emissiveIntensity ?? 0, 0.18 + emissiveBoost * 1.8);
      }
      if ('roughness' in material && typeof material.roughness === 'number') {
        material.roughness = Math.min(material.roughness, 0.82);
      }
      if ('metalness' in material && typeof material.metalness === 'number') {
        material.metalness = Math.max(material.metalness, 0.16);
      }
    });
  });
}

export function instantiateAsset(asset, options = {}) {
  const {
    height,
    width,
    depth,
    position,
    rotationY = 0,
    tint,
    tintStrength,
    emissiveBoost,
    upAxis = asset?.scene?.userData?.warpUpAxis ?? 'y',
  } = options;

  const source = cloneAssetScene(asset);
  const object = new THREE.Group();
  if (upAxis === 'z') {
    source.rotation.x = -Math.PI / 2;
  }
  object.add(source);
  object.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(object);
  const size = bounds.getSize(new THREE.Vector3());
  const normalizedHeight = size.y > 0.08 ? size.y : Math.max(size.x * 0.42, size.z * 0.28, 0.001);
  const scaleByHeight = height ? height / Math.max(normalizedHeight, 0.001) : null;
  const scaleByWidth = width ? width / Math.max(size.x, 0.001) : null;
  const scaleByDepth = depth ? depth / Math.max(size.z, 0.001) : null;
  const scalar = scaleByHeight ?? scaleByWidth ?? scaleByDepth ?? 1;
  object.scale.setScalar(scalar);
  object.updateMatrixWorld(true);

  const scaledBounds = new THREE.Box3().setFromObject(object);
  const center = scaledBounds.getCenter(new THREE.Vector3());
  object.position.x -= center.x;
  object.position.z -= center.z;
  object.position.y -= scaledBounds.min.y;
  object.rotation.y = rotationY;

  if (position) {
    object.position.x += position.x ?? 0;
    object.position.y += position.y ?? 0;
    object.position.z += position.z ?? 0;
  }

  if (tint) {
    tintImportedModel(object, tint, tintStrength, emissiveBoost);
  }

  return object;
}

export async function loadGameAssets({ onProgress, preloadOptional = false } = {}) {
  if (assetCache) {
    onProgress?.(1);
    return assetCache;
  }

  if (!assetPromise) {
    assetPromise = (async () => {
      const totalAssets = Object.keys(REQUIRED_MODEL_MANIFEST).length
        + Object.keys(TEXTURE_MANIFEST).length
        + (preloadOptional ? Object.keys(OPTIONAL_MODEL_MANIFEST).length : 0);
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/gaming-assets/draco/gltf/');
      dracoLoader.setDecoderConfig({ type: 'js' });

      const loadingManager = new THREE.LoadingManager();
      loadingManager.onProgress = (_, loaded, total) => {
        const expected = Math.max(total, totalAssets);
        onProgress?.(Math.min(1, loaded / expected));
      };

      const gltfLoader = new GLTFLoader(loadingManager);
      gltfLoader.setDRACOLoader(dracoLoader);
      const textureLoader = new THREE.TextureLoader(loadingManager);

      const requiredResults = await Promise.allSettled([
        ...Object.entries(REQUIRED_MODEL_MANIFEST).map(async ([key, path]) => {
          const asset = await withTimeout(gltfLoader.loadAsync(path), path, 20000);
          if (path.includes('/gaming-assets/folio2019/')) {
            asset.scene.userData.warpUpAxis = 'z';
          }
          return [key, asset];
        }),
        ...Object.entries(TEXTURE_MANIFEST).map(async ([key, path]) => {
          const texture = await withTimeout(textureLoader.loadAsync(path), path, 12000);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.flipY = false;
          return [key, texture];
        }),
      ]);

      assetCache = Object.fromEntries(collectFulfilledEntries(requiredResults));

      const loadOptionalAssets = async (timeoutMs) => {
        try {
          const optionalLoader = new GLTFLoader(loadingManager);
          optionalLoader.setDRACOLoader(dracoLoader);
          const optionalResults = await loadManifestEntries(
            Object.entries(OPTIONAL_MODEL_MANIFEST),
            async (path) => {
              const asset = await optionalLoader.loadAsync(path);
              if (path.includes('/gaming-assets/folio2019/')) {
                asset.scene.userData.warpUpAxis = 'z';
              }
              return asset;
            },
            timeoutMs,
          );
          Object.assign(assetCache, Object.fromEntries(collectFulfilledEntries(optionalResults)));
        } catch (error) {
          console.warn('[gaming-assets] Optional asset warmup failed', error);
        }
      };

      if (preloadOptional) {
        await loadOptionalAssets(16000);
      } else {
        window.setTimeout(() => {
          void loadOptionalAssets(8000);
        }, 0);
      }
      onProgress?.(1);
      return assetCache;
    })();
  }

  const assets = await assetPromise;
  onProgress?.(1);
  return assets;
}
