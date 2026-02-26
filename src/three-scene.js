import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { clamp01, damp } from './utils/math.js';
import { createStarTexture, createSoftCircleTexture } from './scene/textures.js';
import { createScreenTexture } from './scene/screen.js';
import { createStarLayer } from './scene/stars.js';
import { createLaptopModel } from './scene/laptop.js';

export { createLaptopModel };

export function initThreeScene() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return () => {};

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manualReducedMotion = document.body?.dataset.motion === 'reduced';
  let prefersReducedMotion = reducedMotionQuery.matches || manualReducedMotion;

  const isMobile = window.innerWidth < 920;
  const SCENE_TUNING = {
    maxPixelRatio: 1.8,
    heroRangeMultiplier: 2.4,
    heroViewportKickScale: 2.1,
    minViewportKickHeight: 1380,
    scrollBlendGlobal: 0.26,
    scrollBlendViewport: 0.5,
    laptopBaseXDesktop: 3.98,
    laptopBaseXMobile: 0.56,
    laptopBaseY: 0.04,
    laptopBaseZ: -0.4,
  };

  let renderer = null;
  let pmrem = null;
  let envRT = null;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, SCENE_TUNING.maxPixelRatio));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.07;

    pmrem = new THREE.PMREMGenerator(renderer);
    envRT = pmrem.fromScene(new RoomEnvironment(), 0.05);
  } catch (error) {
    if (envRT) envRT.dispose();
    if (pmrem) pmrem.dispose();
    if (renderer) renderer.dispose();
    canvas.style.display = 'none';
    console.warn('[three-scene] WebGL initialization failed. Scene disabled.', error);
    return () => {};
  }

  const scene = new THREE.Scene();
  scene.environment = envRT.texture;
  scene.fog = new THREE.Fog(0x090b13, 9, 26);

  const camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 0.1, 90);
  camera.position.set(isMobile ? 0.08 : 0.14, 1.2, 6.9);

  scene.add(new THREE.AmbientLight(0xffffff, 0.2));

  const hemi = new THREE.HemisphereLight(0xc5dcff, 0x070a12, 0.46);
  hemi.position.set(0, 8, 0);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff2e5, 1.26);
  key.position.set(5.2, 5.4, 4.1);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x8ebcff, 0.54);
  fill.position.set(-5.4, 2.5, 3.7);
  scene.add(fill);

  const rim = new THREE.PointLight(0x74dcff, 1.04, 24, 2);
  rim.position.set(-3.4, 2.2, -3.1);
  scene.add(rim);

  const bounce = new THREE.PointLight(0xb9c8ff, 0.42, 12, 2.2);
  bounce.position.set(1.2, 0.68, 2.2);
  scene.add(bounce);

  const topAccent = new THREE.DirectionalLight(0xc3e2ff, 0.32);
  topAccent.position.set(0, 6.5, -2.4);
  scene.add(topAccent);

  const starTexture = createStarTexture();
  const glowTexture = createSoftCircleTexture('rgba(255,255,255,0.95)', 'rgba(255,255,255,0)', 512);
  const screenDisplay = createScreenTexture();

  const laptop = createLaptopModel({
    screen: screenDisplay,
    glow: glowTexture,
  });
  scene.add(laptop.root);

  let isDestroyed = false;

  const baseX = isMobile ? SCENE_TUNING.laptopBaseXMobile : SCENE_TUNING.laptopBaseXDesktop;
  laptop.root.position.set(baseX, SCENE_TUNING.laptopBaseY, SCENE_TUNING.laptopBaseZ);

  const layerConfig = prefersReducedMotion
    ? [
        { count: isMobile ? 200 : 280, spreadX: 42, spreadY: 24, depth: 22, size: 0.05, opacity: 0.13, parallax: 0.16, speed: 0.02 },
        { count: isMobile ? 130 : 190, spreadX: 32, spreadY: 18, depth: 16, size: 0.07, opacity: 0.1, parallax: 0.24, speed: 0.028 },
      ]
    : [
        { count: isMobile ? 320 : 500, spreadX: 46, spreadY: 26, depth: 28, size: 0.045, opacity: 0.15, parallax: 0.12, speed: 0.024 },
        { count: isMobile ? 220 : 360, spreadX: 36, spreadY: 20, depth: 20, size: 0.062, opacity: 0.12, parallax: 0.22, speed: 0.032 },
        { count: isMobile ? 100 : 180, spreadX: 26, spreadY: 15, depth: 12, size: 0.085, opacity: 0.095, parallax: 0.32, speed: 0.04 },
      ];

  const starLayers = layerConfig.map((cfg) => createStarLayer(cfg, starTexture));
  starLayers.forEach((layer) => scene.add(layer.points));

  const state = {
    pointerTargetX: 0,
    pointerTargetY: 0,
    pointerX: 0,
    pointerY: 0,
    scrollTarget: 0,
    scroll: 0,
    scrollVelocity: 0,
    prevScroll: 0,
    rotX: -0.015,
    rotY: 0.3,
    rotZ: 0,
    lastPointerMs: performance.now(),
  };
  const cameraLookTarget = new THREE.Vector3(baseX * 0.36, 0.24, -0.08);

  let rafId = 0;
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const screenTargets = [laptop.panelGlass, laptop.panel];

  function isScreenHit(clientX, clientY) {
    pointerNdc.x = (clientX / window.innerWidth) * 2 - 1;
    pointerNdc.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    return raycaster.intersectObjects(screenTargets, false).length > 0;
  }

  function isLaptopHit(clientX, clientY) {
    pointerNdc.x = (clientX / window.innerWidth) * 2 - 1;
    pointerNdc.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    return raycaster.intersectObject(laptop.root, true).length > 0;
  }

  function updatePointer(clientX, clientY) {
    state.pointerTargetX = (clientX / window.innerWidth) * 2 - 1;
    state.pointerTargetY = (clientY / window.innerHeight) * 2 - 1;
    state.lastPointerMs = performance.now();
  }

  function onPointerMove(event) {
    if (prefersReducedMotion) return;
    if (screenDisplay.isFocused()) return;
    updatePointer(event.clientX, event.clientY);
  }

  function onMouseMove(event) {
    if (prefersReducedMotion) return;
    if (screenDisplay.isFocused()) return;
    updatePointer(event.clientX, event.clientY);
  }

  function onPointerDown(event) {
    updatePointer(event.clientX, event.clientY);
    const screenHit = isScreenHit(event.clientX, event.clientY);
    const laptopHit = isLaptopHit(event.clientX, event.clientY);
    screenDisplay.setFocus(screenHit || laptopHit);
    if ((screenHit || laptopHit) && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('warp:pc-open', { detail: { source: 'scene' } }));
    }
  }

  function onTouchStart(event) {
    if (!event.touches || !event.touches[0]) return;
    const touch = event.touches[0];
    updatePointer(touch.clientX, touch.clientY);
    const screenHit = isScreenHit(touch.clientX, touch.clientY);
    const laptopHit = isLaptopHit(touch.clientX, touch.clientY);
    screenDisplay.setFocus(screenHit || laptopHit);
    if ((screenHit || laptopHit) && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('warp:pc-open', { detail: { source: 'scene-touch' } }));
    }
  }

  function onTouchMove(event) {
    if (prefersReducedMotion) return;
    if (screenDisplay.isFocused()) return;
    if (!event.touches || !event.touches[0]) return;
    updatePointer(event.touches[0].clientX, event.touches[0].clientY);
  }

  function resetPointer() {
    state.pointerTargetX = 0;
    state.pointerTargetY = 0;
  }

  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const globalProgress = clamp01(max > 0 ? doc.scrollTop / max : 0);

    // Hero-local progress (strong response in first viewport) + global fallback.
    const heroSection = document.getElementById('hero');
    const heroStart = heroSection ? heroSection.offsetTop : 0;
    const heroRange = heroSection
      ? Math.max(heroSection.offsetHeight * SCENE_TUNING.heroRangeMultiplier, window.innerHeight * SCENE_TUNING.heroRangeMultiplier)
      : Math.max(window.innerHeight * SCENE_TUNING.heroRangeMultiplier, 1200);
    const heroProgress = clamp01((window.scrollY - heroStart) / heroRange);
    const viewportKick = clamp01(
      window.scrollY / Math.max(window.innerHeight * SCENE_TUNING.heroViewportKickScale, SCENE_TUNING.minViewportKickHeight)
    );

    state.scrollTarget = clamp01(
      Math.max(globalProgress * SCENE_TUNING.scrollBlendGlobal, heroProgress, viewportKick * SCENE_TUNING.scrollBlendViewport)
    );
  }

  function onResize() {
    if (!renderer || isDestroyed) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    try {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, SCENE_TUNING.maxPixelRatio));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    } catch (error) {
      console.warn('[three-scene] Resize update failed.', error);
    }
  }

  function onReducedMotionChange(event) {
    prefersReducedMotion = event.matches || manualReducedMotion;
  }

  function onMotionModeChange(event) {
    const mode = event?.detail?.mode;
    manualReducedMotion = mode === 'reduced' || document.body?.dataset.motion === 'reduced';
    prefersReducedMotion = reducedMotionQuery.matches || manualReducedMotion;
  }

  function onProjectRegistry(event) {
    const incoming = event?.detail?.projects;
    screenDisplay.setProjects(incoming);
  }

  function onTerminalRunProject(event) {
    const projectId = event?.detail?.projectId;
    if (!projectId) return;
    screenDisplay.setFocus(true);
    screenDisplay.runProjectById(projectId);
  }

  function onTerminalFocus() {
    screenDisplay.setFocus(true);
  }

  function onVisibilityChange() {
    if (document.hidden) resetPointer();
  }

  function onKeyDown(event) {
    if (screenDisplay.handleKeyDown(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('blur', resetPointer);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('warp:motion-mode', onMotionModeChange);
  window.addEventListener('warp:project-registry', onProjectRegistry);
  window.addEventListener('warp:terminal-run-project', onTerminalRunProject);
  window.addEventListener('warp:terminal-focus', onTerminalFocus);

  if (reducedMotionQuery.addEventListener) {
    reducedMotionQuery.addEventListener('change', onReducedMotionChange);
  } else {
    reducedMotionQuery.addListener(onReducedMotionChange);
  }

  onScroll();
  onResize();

  const clock = new THREE.Clock();
  const keyboardColor = new THREE.Color();
  const frontLedColor = new THREE.Color();
  let lastKeyboardColorTick = 0;

  function render() {
    if (isDestroyed || !renderer) return;
    rafId = requestAnimationFrame(render);

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    const idleTime = performance.now() - state.lastPointerMs;
    if (idleTime > 900) {
      state.pointerTargetX = damp(state.pointerTargetX, 0, 2.2, dt);
      state.pointerTargetY = damp(state.pointerTargetY, 0, 2.2, dt);
    }

    const motionFactor = prefersReducedMotion ? 0.32 : 1;

    state.pointerX = damp(state.pointerX, state.pointerTargetX, prefersReducedMotion ? 2.8 : 9.4, dt);
    state.pointerY = damp(state.pointerY, state.pointerTargetY, prefersReducedMotion ? 2.8 : 9.4, dt);
    state.scroll = damp(state.scroll, state.scrollTarget, 6, dt);
    const rawVelocity = (state.scroll - state.prevScroll) / Math.max(dt, 1 / 180);
    state.scrollVelocity = damp(state.scrollVelocity, rawVelocity, 9, dt);
    state.prevScroll = state.scroll;

    const pointerCurveX = Math.tanh(state.pointerX * 1.22);
    const pointerCurveY = Math.tanh(state.pointerY * 1.25);

    const basePitch = 0.044 + Math.sin(t * 0.54) * 0.005 * motionFactor;
    const baseYaw = 0.28 + state.scroll * 0.16;
    const baseRoll = Math.sin(t * 0.42) * 0.004 * motionFactor;

    const velocityKick = THREE.MathUtils.clamp(state.scrollVelocity * 0.2, -0.11, 0.11);
    const targetPitch = basePitch - pointerCurveY * 0.082 * motionFactor - velocityKick * 0.14;
    const targetYaw = baseYaw + pointerCurveX * 0.22 * motionFactor;
    const targetRoll = baseRoll - pointerCurveX * 0.026 * motionFactor + velocityKick * 0.12;

    state.rotX = damp(state.rotX, targetPitch, 8.2, dt);
    state.rotY = damp(state.rotY, targetYaw, 8.2, dt);
    state.rotZ = damp(state.rotZ, targetRoll, 7, dt);

    laptop.root.rotation.set(state.rotX, state.rotY, state.rotZ);

    const bob = Math.sin(t * 0.84) * 0.05 * motionFactor;
    const sway = Math.sin(t * 0.42 + state.scroll * 1.35) * 0.03 * motionFactor;
    const targetX = baseX + pointerCurveX * 0.26 * motionFactor + sway;
    const targetY = 0.08 + bob - pointerCurveY * 0.042 * motionFactor - state.scroll * 0.2 - velocityKick * 0.035;
    const targetZ = -0.34 - state.scroll * 0.58;

    laptop.root.position.x = damp(laptop.root.position.x, targetX, 6.2, dt);
    laptop.root.position.y = damp(laptop.root.position.y, targetY, 6.2, dt);
    laptop.root.position.z = damp(laptop.root.position.z, targetZ, 6.2, dt);

    const openAngle = -0.43 - state.scroll * 0.028 + Math.sin(t * 0.3) * 0.005 * motionFactor + velocityKick * 0.024;
    laptop.lidPivot.rotation.x = damp(laptop.lidPivot.rotation.x, openAngle, 5, dt);

    const pulse = 0.58 + Math.sin(t * 1.55) * 0.11 + state.scroll * 0.2 + Math.min(Math.abs(state.scrollVelocity), 0.6) * 0.05;
    laptop.keyboardMat.emissiveIntensity = (prefersReducedMotion ? 0.36 : 0.4) + pulse * (prefersReducedMotion ? 0.14 : 0.22);
    laptop.panelMat.emissiveIntensity = 0.42 + pulse * 0.2;
    laptop.ledMat.emissiveIntensity = 0.62 + pulse * 0.38;
    laptop.underGlowMat.opacity = 0.09 + pulse * 0.11;

    const ledHue = 0.68 + Math.sin(t * 0.38 + state.scroll * 1.8) * 0.035;
    frontLedColor.setHSL(ledHue, 0.66, 0.64);
    laptop.ledMat.color.copy(frontLedColor);
    laptop.ledMat.emissive.copy(frontLedColor).multiplyScalar(0.42);

    if (!prefersReducedMotion && t - lastKeyboardColorTick > 0.036) {
      lastKeyboardColorTick = t;
      for (let i = 0; i < laptop.keyRows * laptop.keyCols; i++) {
        const row = Math.floor(i / laptop.keyCols);
        const col = i % laptop.keyCols;
        const hue = 0.58 + (col / (laptop.keyCols - 1)) * 0.16 + Math.sin(t * 0.82 + row * 0.56 + state.scroll * 2.1) * 0.018;
        const lightness = 0.48 + Math.sin(t * 1.42 + col * 0.36 + row * 0.2 + state.scroll * 4.8) * 0.065;
        keyboardColor.setHSL((hue % 1 + 1) % 1, 0.56, THREE.MathUtils.clamp(lightness, 0.39, 0.66));
        laptop.keys.setColorAt(i, keyboardColor);
      }
      if (laptop.keys.instanceColor) laptop.keys.instanceColor.needsUpdate = true;
    }

    screenDisplay.update(t, state.scroll, state.scrollVelocity, dt);

    const cameraDrift = prefersReducedMotion ? 0.35 : 1;
    const camTargetX = (isMobile ? 0.07 : 0.15) + pointerCurveX * 0.26 * cameraDrift + state.scroll * 0.06;
    const camTargetY = 1.18 - pointerCurveY * 0.052 * cameraDrift - state.scroll * 0.058 + Math.sin(t * 0.34) * 0.012 * cameraDrift;
    const camTargetZ = 6.88 + state.scroll * 0.2 + Math.sin(t * 0.46) * 0.025 * cameraDrift;

    camera.position.x = damp(camera.position.x, camTargetX, 4.6, dt);
    camera.position.y = damp(camera.position.y, camTargetY, 4.6, dt);
    camera.position.z = damp(camera.position.z, camTargetZ, 4.2, dt);

    const lookTargetX = baseX * 0.36 + pointerCurveX * 0.08 * cameraDrift;
    const lookTargetY = 0.24 - state.scroll * 0.045 - pointerCurveY * 0.03 * cameraDrift;
    const lookTargetZ = -0.08 - state.scroll * 0.03;
    cameraLookTarget.x = damp(cameraLookTarget.x, lookTargetX, prefersReducedMotion ? 3.4 : 5.2, dt);
    cameraLookTarget.y = damp(cameraLookTarget.y, lookTargetY, prefersReducedMotion ? 3.4 : 5.2, dt);
    cameraLookTarget.z = damp(cameraLookTarget.z, lookTargetZ, prefersReducedMotion ? 3.4 : 5.2, dt);
    camera.lookAt(cameraLookTarget);

    starLayers.forEach((layer, index) => {
      const depth = 1 + index * 0.28;
      layer.points.rotation.y += layer.speed * depth * dt * (1 + state.scroll * 0.7) * motionFactor;
      layer.points.rotation.x += layer.speed * 0.28 * dt * motionFactor;

      const layerX = -state.pointerX * layer.parallax * 0.7 * motionFactor;
      const layerY = state.pointerY * layer.parallax * 0.58 * motionFactor;

      layer.points.position.x = damp(layer.points.position.x, layerX, 2.5, dt);
      layer.points.position.y = damp(layer.points.position.y, layerY, 2.5, dt);
      layer.points.position.z = Math.sin(t * 0.22 + layer.phase) * 0.25 * depth * motionFactor;

      layer.material.opacity = layer.baseOpacity * (1 - layer.twinkleAmount + Math.sin(t * layer.twinkleSpeed + layer.phase) * layer.twinkleAmount);
    });

    try {
      renderer.render(scene, camera);
    } catch (error) {
      isDestroyed = true;
      cancelAnimationFrame(rafId);
      console.warn('[three-scene] Render failed. Animation loop stopped.', error);
    }
  }

  render();

  return () => {
    cancelAnimationFrame(rafId);
    isDestroyed = true;

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('blur', resetPointer);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('warp:motion-mode', onMotionModeChange);
    window.removeEventListener('warp:project-registry', onProjectRegistry);
    window.removeEventListener('warp:terminal-run-project', onTerminalRunProject);
    window.removeEventListener('warp:terminal-focus', onTerminalFocus);

    if (reducedMotionQuery.removeEventListener) {
      reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
    } else {
      reducedMotionQuery.removeListener(onReducedMotionChange);
    }

    starLayers.forEach((layer) => {
      layer.geometry.dispose();
      layer.material.dispose();
    });

    laptop.geometries.forEach((geometry) => geometry.dispose());
    laptop.materials.forEach((material) => material.dispose());

    starTexture.dispose();
    glowTexture.dispose();
    screenDisplay.texture.dispose();

    if (envRT) envRT.dispose();
    if (pmrem) pmrem.dispose();
    if (renderer) renderer.dispose();
  };
}
