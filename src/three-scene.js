import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const laptopModelUrl = `${import.meta.env.BASE_URL}laptop.glb`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function damp(current, target, lambda, delta) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}

function fitObjectToSize(root, maxSize = 3.6) {
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return;

  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z, 0.001);
  const scale = maxSize / maxDimension;
  root.scale.multiplyScalar(scale);

  const recentered = new THREE.Box3().setFromObject(root);
  const center = recentered.getCenter(new THREE.Vector3());
  root.position.sub(center);

  const grounded = new THREE.Box3().setFromObject(root);
  root.position.y -= grounded.min.y;
}

function disposeMaterial(material) {
  if (!material) return;
  if (material.map) material.map.dispose();
  if (material.normalMap) material.normalMap.dispose();
  if (material.roughnessMap) material.roughnessMap.dispose();
  if (material.metalnessMap) material.metalnessMap.dispose();
  if (material.emissiveMap) material.emissiveMap.dispose();
  material.dispose();
}

function disposeObject(root) {
  root.traverse((node) => {
    if (!node?.isMesh) return;
    if (node.geometry) node.geometry.dispose();
    if (Array.isArray(node.material)) node.material.forEach(disposeMaterial);
    else disposeMaterial(node.material);
  });
}

function createStarField(scene) {
  const count = 420;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 42;
    positions[i3 + 1] = (Math.random() - 0.5) * 24;
    positions[i3 + 2] = -Math.random() * 26 - 1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xdbe6ff,
    size: 0.06,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return { points, geometry, material };
}

export function initThreeScene() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return () => {};

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manualReduced = document.body?.dataset.motion === 'reduced';
  const isReduced = () => reducedMotionQuery.matches || manualReduced;
  let destroyed = false;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (error) {
    canvas.style.display = 'none';
    console.warn('[three-scene] WebGL is not available in this environment.', error);
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a0f, 8, 30);

  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(1.18, 1.05, 6.3);

  const hemiLight = new THREE.HemisphereLight(0xaec6ff, 0x12152a, 0.6);
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.96);
  keyLight.position.set(2.4, 4.6, 3.8);
  const rimLight = new THREE.PointLight(0x7aa4ff, 0.7, 18, 2.1);
  rimLight.position.set(-2.7, 1.7, -2.5);
  scene.add(hemiLight, keyLight, rimLight);

  const stars = createStarField(scene);

  const laptopAnchor = new THREE.Group();
  laptopAnchor.position.set(0.4, 0, -0.6);
  scene.add(laptopAnchor);

  let laptop = null;
  const loader = new GLTFLoader();
  loader.load(
    laptopModelUrl,
    (gltf) => {
      if (destroyed) {
        if (gltf.scene) disposeObject(gltf.scene);
        return;
      }
      laptop = gltf.scene || gltf.scenes?.[0] || null;
      if (!laptop) return;
      fitObjectToSize(laptop, 3.5);
      laptop.rotation.set(0.12, 0.6, 0);
      laptop.position.set(0, 0.08, 0);
      laptop.traverse((node) => {
        if (!node?.isMesh) return;
        node.castShadow = false;
        node.receiveShadow = false;
        if (node.material && 'envMapIntensity' in node.material) {
          node.material.envMapIntensity = Math.max(node.material.envMapIntensity || 0, 1.1);
        }
      });
      laptopAnchor.add(laptop);
    },
    undefined,
    (error) => {
      console.warn('[three-scene] laptop GLB load failed', error);
    }
  );

  const state = {
    pointerTargetX: 0,
    pointerTargetY: 0,
    pointerX: 0,
    pointerY: 0,
    scrollTarget: 0,
    scroll: 0,
  };

  function updateScrollTarget() {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const globalProgress = clamp(window.scrollY / maxScroll, 0, 1);
    const hero = document.getElementById('hero');
    if (!hero) {
      state.scrollTarget = globalProgress;
      return;
    }
    const heroRange = Math.max(hero.offsetHeight * 0.9, window.innerHeight * 1.2);
    const heroProgress = clamp((window.scrollY - hero.offsetTop) / heroRange, 0, 1);
    state.scrollTarget = Math.max(globalProgress * 0.4, heroProgress);
  }

  function onPointerMove(event) {
    state.pointerTargetX = (event.clientX / window.innerWidth) * 2 - 1;
    state.pointerTargetY = (event.clientY / window.innerHeight) * 2 - 1;
  }

  function onScroll() {
    updateScrollTarget();
  }

  function onResize() {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  function onMotionPreference(event) {
    manualReduced = event?.detail?.mode === 'reduced' || document.body?.dataset.motion === 'reduced';
  }

  function onReducedMotionChange() {
    // The query value is read via isReduced() during rendering.
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('warp:motion-mode', onMotionPreference);
  if (reducedMotionQuery.addEventListener) reducedMotionQuery.addEventListener('change', onReducedMotionChange);
  else reducedMotionQuery.addListener(onReducedMotionChange);

  onResize();
  updateScrollTarget();

  const clock = new THREE.Clock();
  let rafId = 0;

  const render = () => {
    if (destroyed) return;
    rafId = requestAnimationFrame(render);

    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.getElapsedTime();
    const motionFactor = isReduced() ? 0.42 : 1;

    state.pointerX = damp(state.pointerX, state.pointerTargetX, 7.8, delta);
    state.pointerY = damp(state.pointerY, state.pointerTargetY, 7.8, delta);
    state.scroll = damp(state.scroll, state.scrollTarget, 5.8, delta);

    const floatY = Math.sin(elapsed * 0.85) * 0.08 * motionFactor;
    const tiltX = -state.pointerY * 0.08 * motionFactor;
    const tiltY = state.pointerX * 0.2 * motionFactor;
    const scrollYaw = state.scroll * 0.3;
    const scrollLift = state.scroll * -0.22;

    if (laptop) {
      laptopAnchor.rotation.x = damp(laptopAnchor.rotation.x, 0.08 + tiltX, 6.2, delta);
      laptopAnchor.rotation.y = damp(laptopAnchor.rotation.y, 0.44 + tiltY + scrollYaw, 6.2, delta);
      laptopAnchor.rotation.z = damp(laptopAnchor.rotation.z, -state.pointerX * 0.025 * motionFactor, 6.2, delta);
      laptopAnchor.position.x = damp(laptopAnchor.position.x, 0.4 + state.pointerX * 0.22 * motionFactor, 5.8, delta);
      laptopAnchor.position.y = damp(laptopAnchor.position.y, floatY + scrollLift, 5.8, delta);
      laptopAnchor.position.z = damp(laptopAnchor.position.z, -0.6 - state.scroll * 0.5, 5.8, delta);
    }

    camera.position.x = damp(camera.position.x, 1.18 + state.pointerX * 0.16 * motionFactor, 4.6, delta);
    camera.position.y = damp(camera.position.y, 1.05 - state.pointerY * 0.06 * motionFactor - state.scroll * 0.07, 4.6, delta);
    camera.position.z = damp(camera.position.z, 6.3 + state.scroll * 0.2, 4.6, delta);
    camera.lookAt(0.22, 0.3 - state.scroll * 0.06, -0.15);

    stars.points.rotation.y += (0.008 + state.scroll * 0.025) * delta * motionFactor;
    stars.points.rotation.x += 0.002 * delta * motionFactor;
    stars.points.position.x = damp(stars.points.position.x, -state.pointerX * 0.5 * motionFactor, 2.5, delta);
    stars.points.position.y = damp(stars.points.position.y, state.pointerY * 0.26 * motionFactor, 2.5, delta);

    renderer.render(scene, camera);
  };

  render();

  return () => {
    destroyed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('warp:motion-mode', onMotionPreference);
    if (reducedMotionQuery.removeEventListener) reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
    else reducedMotionQuery.removeListener(onReducedMotionChange);

    if (laptop) {
      laptopAnchor.remove(laptop);
      disposeObject(laptop);
    }

    scene.remove(stars.points);
    stars.geometry.dispose();
    stars.material.dispose();
    renderer.dispose();
  };
}
