import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import mouseModelUrl from '../computer_mouse.glb?url';
import mousePadModelUrl from '../mouse_pad_keyboard_pad.glb?url';

function clamp01(value) {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function damp(current, target, lambda, delta) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}

function createStarTexture() {
  const size = 96;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.5);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.22, 'rgba(230,240,255,0.92)');
  grad.addColorStop(0.56, 'rgba(167,196,255,0.25)');
  grad.addColorStop(1, 'rgba(167,196,255,0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createSoftCircleTexture(inner, outer, size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.5);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(1, outer);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function collectMeshResources(root) {
  const geometrySet = new Set();
  const materialSet = new Set();

  root.traverse((node) => {
    if (!node || !node.isMesh) return;
    if (node.geometry) geometrySet.add(node.geometry);

    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((material) => {
      if (material) materialSet.add(material);
    });
  });

  return {
    geometries: Array.from(geometrySet),
    materials: Array.from(materialSet),
  };
}

function disposeMaterialDeep(material) {
  if (!material || typeof material.dispose !== 'function') return;

  const mapKeys = [
    'map',
    'alphaMap',
    'aoMap',
    'bumpMap',
    'displacementMap',
    'emissiveMap',
    'envMap',
    'lightMap',
    'metalnessMap',
    'normalMap',
    'roughnessMap',
    'specularMap',
    'clearcoatMap',
    'clearcoatNormalMap',
    'clearcoatRoughnessMap',
    'sheenColorMap',
    'sheenRoughnessMap',
    'thicknessMap',
    'transmissionMap',
  ];

  mapKeys.forEach((key) => {
    const texture = material[key];
    if (texture && texture.isTexture) texture.dispose();
  });

  material.dispose();
}

function disposeAccessoryResources(accessory) {
  if (!accessory) return;

  const seenGeometries = new Set();
  accessory.geometries?.forEach((geometry) => {
    if (!geometry || seenGeometries.has(geometry)) return;
    seenGeometries.add(geometry);
    if (typeof geometry.dispose === 'function') geometry.dispose();
  });

  const seenMaterials = new Set();
  accessory.materials?.forEach((material) => {
    if (!material || seenMaterials.has(material)) return;
    seenMaterials.add(material);
    disposeMaterialDeep(material);
  });

  if (accessory.glowTexture && typeof accessory.glowTexture.dispose === 'function') {
    accessory.glowTexture.dispose();
  }
}

function centerAndScaleObject(root, targetMaxSize, yOffset = 0) {
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return;

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
  const scale = targetMaxSize / maxDim;
  root.scale.multiplyScalar(scale);

  const centeredBox = new THREE.Box3().setFromObject(root);
  const center = centeredBox.getCenter(new THREE.Vector3());
  root.position.sub(center);

  const groundedBox = new THREE.Box3().setFromObject(root);
  root.position.y -= groundedBox.min.y;
  root.position.y += yOffset;
}

function orientModelFlat(root, options = {}) {
  const longAxis = options.longAxis || 'z';
  const box = new THREE.Box3();
  const size = new THREE.Vector3();

  const angles = [0, Math.PI * 0.5, -Math.PI * 0.5, Math.PI];
  let best = null;

  for (let ix = 0; ix < angles.length; ix++) {
    for (let iy = 0; iy < angles.length; iy++) {
      for (let iz = 0; iz < angles.length; iz++) {
        root.rotation.set(angles[ix], angles[iy], angles[iz]);
        root.updateMatrixWorld(true);
        box.setFromObject(root);
        box.getSize(size);

        const score = size.y * 4 + Math.abs(size.x - size.z) * 0.06;
        if (!best || score < best.score) {
          best = {
            score,
            rx: angles[ix],
            ry: angles[iy],
            rz: angles[iz],
            sx: size.x,
            sy: size.y,
            sz: size.z,
          };
        }
      }
    }
  }

  if (!best) return;

  root.rotation.set(best.rx, best.ry, best.rz);
  root.updateMatrixWorld(true);
  box.setFromObject(root);
  box.getSize(size);

  if (longAxis === 'z' && size.x > size.z * 1.04) {
    root.rotation.y += Math.PI * 0.5;
  } else if (longAxis === 'x' && size.z > size.x * 1.04) {
    root.rotation.y += Math.PI * 0.5;
  }
}

function findWheelMesh(root) {
  let wheel = null;
  root.traverse((node) => {
    if (wheel || !node || !node.isMesh) return;
    const name = (node.name || '').toLowerCase();
    if (name.includes('wheel') || name.includes('scroll')) wheel = node;
  });
  return wheel;
}

function findAccentMaterial(root) {
  let namedMatch = null;
  let emissiveMatch = null;

  root.traverse((node) => {
    if (!node || !node.isMesh) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];

    materials.forEach((material) => {
      if (!material) return;
      const name = (material.name || '').toLowerCase();

      if (!namedMatch && (name.includes('led') || name.includes('logo') || name.includes('light'))) {
        namedMatch = material;
      }

      if (!emissiveMatch && material.emissive && material.emissiveIntensity > 0.01) {
        emissiveMatch = material;
      }
    });
  });

  return namedMatch || emissiveMatch || null;
}

function tunePbrMaterials(root, options = {}) {
  const roughnessMul = options.roughnessMul ?? 0.88;
  const metalnessBoost = options.metalnessBoost ?? 0.06;
  const envBoost = options.envMapIntensity ?? 1.2;

  root.traverse((node) => {
    if (!node || !node.isMesh) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];

    materials.forEach((material) => {
      if (!material) return;

      if (typeof material.roughness === 'number') {
        material.roughness = THREE.MathUtils.clamp(material.roughness * roughnessMul, 0.04, 0.95);
      }

      if (typeof material.metalness === 'number') {
        material.metalness = THREE.MathUtils.clamp(material.metalness + metalnessBoost, 0, 1);
      }

      if ('envMapIntensity' in material && typeof material.envMapIntensity === 'number') {
        material.envMapIntensity = Math.max(material.envMapIntensity, envBoost);
      }

      material.needsUpdate = true;
    });
  });
}

function loadAccessoryModel(loader, url, options) {
  const opts = {
    targetMaxSize: 1,
    yOffset: 0,
    roughnessMul: 0.9,
    metalnessBoost: 0.05,
    envMapIntensity: 1.15,
    glowColor: 0x2ec8ff,
    glowOpacity: 0.26,
    glowPlane: [0.9, 0.65],
    ...options,
  };

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const modelRoot = gltf.scene || (gltf.scenes && gltf.scenes[0]);
        if (!modelRoot) {
          reject(new Error(`No scene found in GLB: ${url}`));
          return;
        }

        if (opts.autoFlat) {
          orientModelFlat(modelRoot, { longAxis: opts.longAxis || 'z' });
        }
        if (Array.isArray(opts.modelRotation) && opts.modelRotation.length === 3) {
          modelRoot.rotation.set(opts.modelRotation[0], opts.modelRotation[1], opts.modelRotation[2]);
        }
        if (Array.isArray(opts.modelScale) && opts.modelScale.length === 3) {
          modelRoot.scale.set(opts.modelScale[0], opts.modelScale[1], opts.modelScale[2]);
        }

        tunePbrMaterials(modelRoot, opts);
        centerAndScaleObject(modelRoot, opts.targetMaxSize, opts.yOffset);

        if (Array.isArray(opts.modelOffset) && opts.modelOffset.length === 3) {
          modelRoot.position.add(new THREE.Vector3(opts.modelOffset[0], opts.modelOffset[1], opts.modelOffset[2]));
        }

        const group = new THREE.Group();
        group.add(modelRoot);

        const glowTexture = createSoftCircleTexture('rgba(255,255,255,0.95)', 'rgba(255,255,255,0)', 256);
        const glowMat = new THREE.MeshBasicMaterial({
          map: glowTexture,
          transparent: true,
          opacity: opts.glowOpacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          color: opts.glowColor,
        });
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(opts.glowPlane[0], opts.glowPlane[1]), glowMat);
        glow.rotation.x = -Math.PI * 0.5;
        glow.position.y = -0.012;
        group.add(glow);

        const wheel = findWheelMesh(modelRoot);
        const sideLedMat = findAccentMaterial(modelRoot);
        const resources = collectMeshResources(group);
        resources.materials.push(glowMat);
        resources.geometries.push(glow.geometry);

        group.scale.setScalar(0.001);

        resolve({
          group,
          wheel,
          sideLedMat,
          glowMat,
          glowTexture,
          materials: resources.materials,
          geometries: resources.geometries,
        });
      },
      undefined,
      (error) => reject(error)
    );
  });
}

function createScreenTexture() {
  const width = 1536;
  const height = 960;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = width;
  baseCanvas.height = height;
  const baseCtx = baseCanvas.getContext('2d');

  function roundedRect(drawCtx, x, y, w, h, r) {
    drawCtx.beginPath();
    drawCtx.moveTo(x + r, y);
    drawCtx.lineTo(x + w - r, y);
    drawCtx.quadraticCurveTo(x + w, y, x + w, y + r);
    drawCtx.lineTo(x + w, y + h - r);
    drawCtx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    drawCtx.lineTo(x + r, y + h);
    drawCtx.quadraticCurveTo(x, y + h, x, y + h - r);
    drawCtx.lineTo(x, y + r);
    drawCtx.quadraticCurveTo(x, y, x + r, y);
    drawCtx.closePath();
  }

  const ide = {
    x: 74,
    y: 54,
    w: 1390,
    h: 852,
    sidebarX: 98,
    codeX: 224,
    codeY: 124,
    codeW: 1136,
    codeH: 552,
    termX: 224,
    termY: 700,
    termW: 1136,
    termH: 156,
  };

  const tabDefinitions = [
    { label: 'hero.config.ts', accent: 'rgba(194, 164, 255, 0.88)' },
    { label: 'scene/laptop.ts', accent: 'rgba(150, 205, 255, 0.88)' },
    { label: 'fx/scroll-driven.ts', accent: 'rgba(148, 236, 197, 0.86)' },
    { label: 'terminal/live.log', accent: 'rgba(247, 189, 146, 0.88)' },
  ];

  const codeBanks = [
    [
      'import { animate } from "animejs";',
      'const heroTitle = document.querySelector(".hero-title");',
      'const ctas = document.querySelectorAll(".hero-cta .btn");',
      '',
      'animate(heroTitle, {',
      '  opacity: [0, 1],',
      '  translateY: [28, 0],',
      '  duration: 950,',
      '  easing: "out(3)",',
      '});',
      '',
      'animate(ctas, {',
      '  opacity: [0, 1],',
      '  scale: [0.94, 1],',
      '  delay: (_, i) => 120 * i,',
      '});',
    ],
    [
      'import * as THREE from "three";',
      'const scene = new THREE.Scene();',
      'const laptop = createLaptopModel({ quality: "ultra" });',
      '',
      'laptop.setMaterials({',
      '  chassis: { metalness: 0.62, roughness: 0.28 },',
      '  glass: { transmission: 0.9, roughness: 0.05 },',
      '  leds: { intensity: 1.2, accent: "#c084fc" },',
      '});',
      '',
      'renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));',
      'renderer.toneMappingExposure = 1.08;',
      'renderer.render(scene, camera);',
    ],
    [
      'const state = { pointer: 0, scroll: 0, velocity: 0 };',
      '',
      'function onScroll(progress, velocity) {',
      '  state.scroll = progress;',
      '  state.velocity = velocity;',
      '  laptop.setDepth(0.2 + progress * 0.9);',
      '  laptop.setParallax(progress * 0.8);',
      '  stars.parallax(progress, velocity);',
      '}',
      '',
      'window.addEventListener("scroll", () => {',
      '  const p = readScrollProgress();',
      '  onScroll(p, p - state.scroll);',
      '}, { passive: true });',
    ],
    [
      'visitor@warp:~$ help',
      'commands: help, status, stack, sections, glow, clear, ping',
      '',
      'visitor@warp:~$ status',
      'scene: online | stars: synced | hero: active',
      '',
      'visitor@warp:~$ stack',
      'three.js + anime.js + vite + canvas texture',
      '',
      'visitor@warp:~$ ping',
      'pong :: render loop stable',
    ],
  ];

  const keywordTokens = new Set([
    'const',
    'let',
    'function',
    'return',
    'import',
    'from',
    'export',
    'default',
    'new',
    'window',
    'document',
  ]);

  const terminal = {
    focused: false,
    input: '',
    lines: [],
    history: [],
    historyIndex: -1,
    metrics: {
      scroll: 0,
      velocity: 0,
      time: 0,
      energy: 0,
    },
    milestones: {
      m1: false,
      m2: false,
      m3: false,
    },
  };

  function pushLine(text, type = 'info') {
    terminal.lines.push({ text, type, at: performance.now() });
    if (terminal.lines.length > 72) terminal.lines.shift();
  }

  pushLine('[boot] portfolio scene initialized', 'ok');
  pushLine('[hint] click screen and type "help"', 'hint');

  function executeCommand(raw) {
    const input = raw.trim();
    if (!input) return;

    pushLine(`visitor@warp:~$ ${input}`, 'cmd');
    terminal.history.push(input);
    terminal.historyIndex = terminal.history.length;

    const [command, ...rest] = input.split(/\s+/);
    const arg = rest.join(' ').toLowerCase();

    switch (command.toLowerCase()) {
      case 'help':
        pushLine('commands: help, status, stack, sections, focus, clear, glow, ping', 'ok');
        break;
      case 'status':
        pushLine(
          `scene: online | scroll ${(terminal.metrics.scroll * 100).toFixed(1)}% | velocity ${terminal.metrics.velocity.toFixed(2)} | glow ${terminal.metrics.energy.toFixed(2)}`,
          'ok'
        );
        break;
      case 'stack':
        pushLine('stack: Three.js + Anime.js + Vite + CanvasTexture', 'ok');
        break;
      case 'sections':
        pushLine('sections: hero, about, skills, projects, experience, contact', 'ok');
        break;
      case 'focus':
        pushLine('focus target: hero laptop + live IDE overlay', 'ok');
        break;
      case 'ping':
        pushLine('pong :: render loop stable', 'ok');
        break;
      case 'glow':
        if (arg === 'up') {
          terminal.metrics.energy = Math.min(2.8, terminal.metrics.energy + 0.22);
          pushLine('glow intensity boosted', 'ok');
        } else if (arg === 'down') {
          terminal.metrics.energy = Math.max(0.1, terminal.metrics.energy - 0.2);
          pushLine('glow intensity reduced', 'ok');
        } else {
          pushLine('usage: glow up | glow down', 'hint');
        }
        break;
      case 'clear':
        terminal.lines = [];
        pushLine('[terminal] cleared', 'ok');
        break;
      default:
        pushLine(`unknown command: ${command}`, 'warn');
        pushLine('tip: type "help"', 'hint');
    }
  }

  function setFocus(focused) {
    if (terminal.focused === focused) return;
    terminal.focused = focused;
    if (focused) {
      pushLine('[interactive] terminal focus enabled', 'ok');
    } else {
      pushLine('[interactive] terminal focus released', 'hint');
    }
  }

  function handleKeyDown(event) {
    const target = event.target;
    const isTypingTarget =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable);

    if (!terminal.focused) {
      if (isTypingTarget) return false;
      if ((event.ctrlKey && event.key.toLowerCase() === 'i') || event.key === '`') {
        setFocus(true);
        return true;
      }
      return false;
    }

    if (event.key === 'Escape') {
      setFocus(false);
      return true;
    }

    if (event.key === 'Enter') {
      executeCommand(terminal.input);
      terminal.input = '';
      return true;
    }

    if (event.key === 'Backspace') {
      terminal.input = terminal.input.slice(0, -1);
      return true;
    }

    if (event.key === 'ArrowUp') {
      if (terminal.history.length > 0) {
        terminal.historyIndex = Math.max(0, terminal.historyIndex - 1);
        terminal.input = terminal.history[terminal.historyIndex] || '';
      }
      return true;
    }

    if (event.key === 'ArrowDown') {
      if (terminal.history.length > 0) {
        terminal.historyIndex = Math.min(terminal.history.length, terminal.historyIndex + 1);
        terminal.input = terminal.history[terminal.historyIndex] || '';
      }
      return true;
    }

    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      terminal.input += event.key;
      return true;
    }

    return false;
  }

  function tokenizeCode(line) {
    return line.match(/(\".*?\"|\'.*?\'|`.*?`|\/\/.*|[A-Za-z_]\w*|\d+|[^\sA-Za-z_])/g) || [''];
  }

  function tokenColor(token) {
    if (!token) return 'rgba(208, 220, 255, 0.7)';
    if (token.startsWith('//')) return 'rgba(132, 148, 188, 0.66)';
    if (token[0] === '"' || token[0] === "'" || token[0] === '`') return 'rgba(219, 185, 255, 0.92)';
    if (keywordTokens.has(token)) return 'rgba(136, 190, 255, 0.95)';
    if (/^\d+$/.test(token)) return 'rgba(252, 176, 176, 0.9)';
    if (/^[{}()[\].,;:+\-*/<>!=]+$/.test(token)) return 'rgba(152, 173, 220, 0.82)';
    return 'rgba(208, 220, 255, 0.88)';
  }

  function drawBase() {
    const bg = baseCtx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#090d1a');
    bg.addColorStop(0.45, '#0f1632');
    bg.addColorStop(1, '#0b1023');
    baseCtx.fillStyle = bg;
    baseCtx.fillRect(0, 0, width, height);

    const nebulaA = baseCtx.createRadialGradient(width * 0.2, height * 0.26, 0, width * 0.2, height * 0.26, width * 0.58);
    nebulaA.addColorStop(0, 'rgba(155,100,255,0.34)');
    nebulaA.addColorStop(1, 'rgba(155,100,255,0)');
    baseCtx.fillStyle = nebulaA;
    baseCtx.fillRect(0, 0, width, height);

    const nebulaB = baseCtx.createRadialGradient(width * 0.82, height * 0.74, 0, width * 0.82, height * 0.74, width * 0.54);
    nebulaB.addColorStop(0, 'rgba(96,165,250,0.32)');
    nebulaB.addColorStop(1, 'rgba(96,165,250,0)');
    baseCtx.fillStyle = nebulaB;
    baseCtx.fillRect(0, 0, width, height);

    roundedRect(baseCtx, ide.x, ide.y, ide.w, ide.h, 16);
    baseCtx.fillStyle = 'rgba(9, 12, 23, 0.72)';
    baseCtx.fill();
    baseCtx.strokeStyle = 'rgba(170, 190, 248, 0.22)';
    baseCtx.lineWidth = 1.4;
    baseCtx.stroke();

    roundedRect(baseCtx, ide.x + 1, ide.y + 1, ide.w - 2, 50, 14);
    baseCtx.fillStyle = 'rgba(24, 36, 72, 0.56)';
    baseCtx.fill();

    const dots = ['#fb7185', '#f59e0b', '#34d399'];
    dots.forEach((color, i) => {
      baseCtx.beginPath();
      baseCtx.fillStyle = color;
      baseCtx.globalAlpha = 0.8;
      baseCtx.arc(ide.x + 24 + i * 18, ide.y + 26, 5, 0, Math.PI * 2);
      baseCtx.fill();
    });
    baseCtx.globalAlpha = 1;

    roundedRect(baseCtx, ide.sidebarX, ide.y + 64, 92, ide.h - 144, 10);
    baseCtx.fillStyle = 'rgba(16, 23, 46, 0.62)';
    baseCtx.fill();

    for (let i = 0; i < 14; i++) {
      roundedRect(baseCtx, ide.sidebarX + 17, ide.y + 88 + i * 42, 58, 8, 4);
      baseCtx.fillStyle = i === 2 ? 'rgba(194, 164, 255, 0.78)' : 'rgba(130, 150, 206, 0.36)';
      baseCtx.fill();
    }

    roundedRect(baseCtx, ide.codeX - 18, ide.codeY - 16, ide.codeW, ide.codeH + 12, 11);
    baseCtx.fillStyle = 'rgba(8, 13, 29, 0.74)';
    baseCtx.fill();

    roundedRect(baseCtx, ide.termX - 18, ide.termY - 12, ide.termW, ide.termH, 10);
    baseCtx.fillStyle = 'rgba(7, 12, 24, 0.84)';
    baseCtx.fill();

    roundedRect(baseCtx, ide.x + ide.w - 34, ide.codeY - 10, 10, ide.codeH - 20, 3);
    baseCtx.fillStyle = 'rgba(98, 118, 175, 0.25)';
    baseCtx.fill();
  }

  drawBase();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  let visualScroll = 0;
  let visualVelocity = 0;
  let energy = 0;
  let cursorBlink = 0;
  let lastTick = -1;
  let lastScroll = 0;
  let autoLogTime = 0;
  let activeTabIndex = 0;

  function update(time, scrollProgress, scrollVelocity = 0, dt = 1 / 60) {
    const delta = Math.min(Math.max(dt, 1 / 180), 1 / 20);
    if (time - lastTick < 0.032 && Math.abs(scrollProgress - lastScroll) < 0.002 && Math.abs(scrollVelocity) < 0.01 && !terminal.focused) return;
    lastTick = time;
    lastScroll = scrollProgress;

    visualVelocity = damp(visualVelocity, Math.abs(scrollVelocity), 7.5, delta);
    energy = damp(energy, 0.22 + scrollProgress * 0.92 + visualVelocity * 0.42 + terminal.metrics.energy * 0.06, 4.8, delta);
    const scrollKick = Math.sign(scrollVelocity) * Math.min(Math.abs(scrollVelocity) * 90, 200);
    visualScroll = damp(visualScroll, scrollProgress * 860 + time * 8 + scrollKick, 5.3, delta);
    cursorBlink += delta;
    autoLogTime += delta;

    const nextTabIndex = Math.min(tabDefinitions.length - 1, Math.floor(scrollProgress * tabDefinitions.length + 0.0001));
    if (nextTabIndex !== activeTabIndex) {
      activeTabIndex = nextTabIndex;
      pushLine(`[tab] switched to ${tabDefinitions[activeTabIndex].label}`, 'ok');
    }

    terminal.metrics.scroll = scrollProgress;
    terminal.metrics.velocity = scrollVelocity;
    terminal.metrics.time = time;
    terminal.metrics.energy = energy;

    if (scrollProgress > 0.12 && !terminal.milestones.m1) {
      terminal.milestones.m1 = true;
      pushLine('[event] accessory::mouse ready', 'ok');
    }
    if (scrollProgress > 0.35 && !terminal.milestones.m2) {
      terminal.milestones.m2 = true;
      pushLine('[event] scene::deep parallax enabled', 'ok');
    }
    if (scrollProgress > 0.62 && !terminal.milestones.m3) {
      terminal.milestones.m3 = true;
      pushLine('[event] viewport::docs mode active', 'ok');
    }
    if (!terminal.focused && autoLogTime > 3.2) {
      autoLogTime = 0;
      pushLine(`[trace] orbit ${(0.44 + scrollProgress * 0.7).toFixed(2)} | render stable`, 'hint');
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(baseCanvas, 0, 0);

    const tabX = ide.codeX - 18;
    const tabY = ide.codeY - 52;
    const tabW = 270;
    const tabH = 30;
    tabDefinitions.forEach((tab, index) => {
      const x = tabX + index * (tabW - 8);
      roundedRect(ctx, x, tabY, tabW, tabH, 8);
      const selected = index === activeTabIndex;
      ctx.fillStyle = selected ? `rgba(25, 37, 74, ${0.78 + energy * 0.08})` : 'rgba(11, 16, 31, 0.66)';
      ctx.fill();
      ctx.strokeStyle = selected ? tab.accent : 'rgba(142, 164, 220, 0.2)';
      ctx.lineWidth = selected ? 1.4 : 1;
      ctx.stroke();
      ctx.fillStyle = selected ? 'rgba(226, 235, 255, 0.92)' : 'rgba(142, 160, 208, 0.68)';
      ctx.font = '15px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.fillText(tab.label, x + 12, tabY + 20);
    });

    const activeCode = codeBanks[activeTabIndex] || codeBanks[0];

    const lineHeight = 30;
    const firstLine = Math.floor(visualScroll / lineHeight);
    const offsetY = visualScroll % lineHeight;
    const visibleLines = 17;

    ctx.save();
    ctx.beginPath();
    roundedRect(ctx, ide.codeX - 18, ide.codeY - 16, ide.codeW, ide.codeH + 12, 11);
    ctx.clip();

    ctx.font = '18px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.textBaseline = 'middle';

    for (let i = -1; i < visibleLines; i++) {
      const lineIndex = (firstLine + i + activeCode.length * 32) % activeCode.length;
      const line = activeCode[lineIndex];
      const y = ide.codeY + i * lineHeight - offsetY;

      if (lineIndex === 4 || lineIndex === 5 || lineIndex === 6) {
        roundedRect(ctx, ide.codeX + 8, y - 11, ide.codeW - 68, 22, 7);
        ctx.fillStyle = `rgba(120, 92, 255, ${0.07 + energy * 0.03})`;
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(132, 146, 188, 0.58)';
      ctx.fillText(String(((lineIndex % 54) + 1)).padStart(2, ' '), ide.codeX + 8, y);

      let cursorX = ide.codeX + 50;
      const tokens = tokenizeCode(line);
      tokens.forEach((token) => {
        ctx.fillStyle = tokenColor(token);
        ctx.globalAlpha = 0.64 + energy * 0.22;
        ctx.fillText(token, cursorX, y);
        cursorX += ctx.measureText(token).width + 8;
      });
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    const terminalRows = terminal.lines.slice(-6);
    ctx.font = '16px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    terminalRows.forEach((entry, i) => {
      let color = 'rgba(146, 170, 226, 0.72)';
      if (entry.type === 'ok') color = 'rgba(172, 244, 196, 0.82)';
      if (entry.type === 'warn') color = 'rgba(255, 191, 168, 0.85)';
      if (entry.type === 'cmd') color = 'rgba(208, 219, 255, 0.9)';
      if (entry.type === 'hint') color = 'rgba(156, 178, 230, 0.72)';
      ctx.fillStyle = color;
      ctx.fillText(entry.text, ide.termX, ide.termY + 18 + i * 22);
    });

    const promptY = ide.termY + ide.termH - 24;
    ctx.fillStyle = terminal.focused ? 'rgba(224, 236, 255, 0.94)' : 'rgba(153, 172, 221, 0.74)';
    ctx.fillText('visitor@warp:~$ ', ide.termX, promptY);

    const promptOffset = ctx.measureText('visitor@warp:~$ ').width;
    const visibleInput = terminal.input.slice(-76);
    ctx.fillStyle = 'rgba(236, 240, 255, 0.92)';
    ctx.fillText(visibleInput, ide.termX + promptOffset, promptY);

    if (terminal.focused && Math.sin(cursorBlink * 5.2) > 0) {
      const caretX = ide.termX + promptOffset + ctx.measureText(visibleInput).width + 2;
      ctx.fillStyle = `rgba(247, 212, 255, ${0.55 + energy * 0.35})`;
      ctx.fillRect(caretX, promptY - 9, 2, 17);
    }

    if (!terminal.focused) {
      ctx.fillStyle = 'rgba(172, 188, 229, 0.58)';
      ctx.font = '15px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.fillText('click screen or press Ctrl+I to interact', ide.termX + 480, promptY);
    }

    const activityWidth = 60 + scrollProgress * 420 + (Math.sin(time * 3.2) * 20 + 20);
    roundedRect(ctx, ide.termX, ide.termY + ide.termH - 7, activityWidth, 4, 2);
    ctx.fillStyle = `rgba(172, 224, 255, ${0.24 + energy * 0.22})`;
    ctx.fill();

    const screenGlow = ctx.createRadialGradient(width * 0.5, height * 0.56, 0, width * 0.5, height * 0.56, width * 0.68);
    screenGlow.addColorStop(0, `rgba(125, 106, 255, ${0.13 + energy * 0.07})`);
    screenGlow.addColorStop(1, 'rgba(125, 106, 255, 0)');
    ctx.fillStyle = screenGlow;
    ctx.fillRect(0, 0, width, height);

    const reflect = ctx.createLinearGradient(width * 0.08, height * 0.14, width * 0.86, height * 0.86);
    reflect.addColorStop(0, 'rgba(255,255,255,0)');
    reflect.addColorStop(0.45, `rgba(255,255,255,${0.07 + energy * 0.03})`);
    reflect.addColorStop(0.58, 'rgba(255,255,255,0.02)');
    reflect.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = reflect;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 0.13 + energy * 0.08;
    for (let i = 0; i < 36; i++) {
      const y = (i / 35) * height;
      ctx.fillStyle = i % 2 === 0 ? '#cbc4ff' : '#8eb6ff';
      ctx.fillRect(0, y, width, 1);
    }
    ctx.globalAlpha = 1;

    texture.needsUpdate = true;
  }

  update(0, 0, 0, 1 / 60);

  return { texture, update, setFocus, handleKeyDown };
}

function createStarLayer(config, texture) {
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
    twinkleSpeed: 0.42 + Math.random() * 0.4,
    twinkleAmount: 0.12 + Math.random() * 0.08,
  };
}

function createLaptopModel(textures) {
  const root = new THREE.Group();

  const materials = [];
  const geometries = [];

  const useMaterial = (material) => {
    materials.push(material);
    return material;
  };

  const useGeometry = (geometry) => {
    geometries.push(geometry);
    return geometry;
  };

  const bodyMat = useMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x111727,
      metalness: 0.66,
      roughness: 0.24,
      clearcoat: 0.56,
      clearcoatRoughness: 0.18,
    })
  );

  const shellMat = useMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x1f283b,
      metalness: 0.58,
      roughness: 0.29,
      clearcoat: 0.28,
      clearcoatRoughness: 0.24,
    })
  );

  const darkMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x070a12,
      metalness: 0.25,
      roughness: 0.6,
    })
  );

  const portMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x090d17,
      metalness: 0.24,
      roughness: 0.78,
    })
  );

  const detailMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x2f374a,
      metalness: 0.64,
      roughness: 0.24,
    })
  );

  const rubberMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x080b12,
      metalness: 0.02,
      roughness: 0.88,
    })
  );

  const ledMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0xcda7ff,
      emissive: new THREE.Color(0x7a3cff),
      emissiveIntensity: 1.15,
      metalness: 0.18,
      roughness: 0.3,
    })
  );

  const keyboardMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0xf6f8ff,
      emissive: new THREE.Color(0x31204f),
      emissiveIntensity: 0.62,
      metalness: 0.12,
      roughness: 0.33,
      vertexColors: true,
    })
  );

  const bezelMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x05070d,
      metalness: 0.1,
      roughness: 0.82,
    })
  );

  const panelMat = useMaterial(
    new THREE.MeshStandardMaterial({
      map: textures.screen.texture,
      emissiveMap: textures.screen.texture,
      emissive: new THREE.Color(0x5677ff),
      emissiveIntensity: 0.64,
      roughness: 0.15,
      metalness: 0.08,
    })
  );

  const glassMat = useMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0xb8ccff,
      transparent: true,
      opacity: 0.05,
      transmission: 0.9,
      roughness: 0.03,
      metalness: 0,
      ior: 1.28,
      thickness: 0.03,
    })
  );

  const shadowMat = useMaterial(
    new THREE.MeshBasicMaterial({
      map: textures.shadow,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      color: 0x000000,
    })
  );

  const underGlowMat = useMaterial(
    new THREE.MeshBasicMaterial({
      map: textures.glow,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0x8f57ff,
    })
  );

  const baseBottom = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(3.44, 0.086, 2.22, 7, 0.03)), bodyMat);
  baseBottom.position.y = 0.005;
  root.add(baseBottom);

  const deck = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(3.34, 0.036, 2.14, 7, 0.024)), shellMat);
  deck.position.y = 0.068;
  root.add(deck);

  const deckBevelFront = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(3.14, 0.007, 0.018, 3, 0.004)), detailMat);
  deckBevelFront.position.set(0, 0.088, 1.06);
  root.add(deckBevelFront);

  const deckBevelLeft = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(0.018, 0.007, 1.62, 3, 0.004)), detailMat);
  deckBevelLeft.position.set(-1.66, 0.088, 0.13);
  root.add(deckBevelLeft);

  const deckBevelRight = deckBevelLeft.clone();
  deckBevelRight.position.x = 1.56;
  root.add(deckBevelRight);

  const keyboardBed = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(2.78, 0.012, 1.16, 5, 0.01)), darkMat);
  keyboardBed.position.set(0, 0.1, -0.03);
  root.add(keyboardBed);

  const keyRows = 6;
  const keyCols = 16;
  const keyCount = keyRows * keyCols;

  const keyGeometry = useGeometry(new RoundedBoxGeometry(0.104, 0.022, 0.104, 2, 0.01));
  const keys = new THREE.InstancedMesh(keyGeometry, keyboardMat, keyCount);
  const tmp = new THREE.Object3D();
  const baseColor = new THREE.Color(0x8790a8);
  const rgbColor = new THREE.Color();
  const finalColor = new THREE.Color();

  let idx = 0;
  for (let row = 0; row < keyRows; row++) {
    for (let col = 0; col < keyCols; col++) {
      const x = (col - (keyCols - 1) * 0.5) * 0.152;
      const z = (row - (keyRows - 1) * 0.5) * 0.144 - 0.14;

      tmp.position.set(x, 0.112, z);
      tmp.rotation.set(0, 0, 0);
      tmp.updateMatrix();
      keys.setMatrixAt(idx, tmp.matrix);

      const hue = 0.72 + (col / (keyCols - 1)) * 0.22 + Math.sin(row * 1.2 + col * 0.45) * 0.01;
      rgbColor.setHSL(hue, 0.62, 0.55);
      finalColor.copy(baseColor).lerp(rgbColor, 0.5);
      keys.setColorAt(idx, finalColor);
      idx += 1;
    }
  }

  keys.instanceMatrix.needsUpdate = true;
  if (keys.instanceColor) keys.instanceColor.needsUpdate = true;
  root.add(keys);

  const touchpad = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(0.86, 0.008, 0.62, 4, 0.02)), shellMat);
  touchpad.position.set(0, 0.095, 0.68);
  root.add(touchpad);

  const frontLed = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(2.55, 0.014, 0.022, 4, 0.01)), ledMat);
  frontLed.position.set(0, 0.018, 1.12);
  root.add(frontLed);

  const leftPortA = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.016, 0.028, 0.24)), portMat);
  leftPortA.position.set(-1.712, 0.032, 0.32);
  root.add(leftPortA);
  const leftPortB = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.012, 0.018, 0.12)), portMat);
  leftPortB.position.set(-1.712, 0.032, -0.02);
  root.add(leftPortB);
  const leftAudio = new THREE.Mesh(useGeometry(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 14)), portMat);
  leftAudio.rotation.z = Math.PI * 0.5;
  leftAudio.position.set(-1.708, 0.032, -0.36);
  root.add(leftAudio);

  const leftHdmi = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.018, 0.022, 0.34)), portMat);
  leftHdmi.position.set(-1.712, 0.031, -0.26);
  root.add(leftHdmi);

  const leftRjTop = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.014, 0.012, 0.2)), portMat);
  leftRjTop.position.set(-1.713, 0.041, 0.58);
  root.add(leftRjTop);
  const leftRjBase = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.018, 0.018, 0.2)), portMat);
  leftRjBase.position.set(-1.712, 0.026, 0.58);
  root.add(leftRjBase);

  const rightPortA = leftPortB.clone();
  rightPortA.position.set(1.712, 0.032, 0.3);
  root.add(rightPortA);
  const rightPortB = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.016, 0.028, 0.24)), portMat);
  rightPortB.position.set(1.712, 0.031, -0.06);
  root.add(rightPortB);

  const rightSd = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.01, 0.006, 0.2)), portMat);
  rightSd.position.set(1.711, 0.02, -0.42);
  root.add(rightSd);

  const rightHdmi = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.018, 0.022, 0.34)), portMat);
  rightHdmi.position.set(1.712, 0.031, 0.1);
  root.add(rightHdmi);

  const rearVentFrame = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(2.98, 0.02, 0.24, 4, 0.01)), darkMat);
  rearVentFrame.position.set(0, 0.094, -0.98);
  root.add(rearVentFrame);

  const rearSlots = new THREE.InstancedMesh(useGeometry(new THREE.BoxGeometry(0.05, 0.009, 0.154)), portMat, 46);
  for (let i = 0; i < 46; i++) {
    const x = (i - 22.5) * 0.061;
    tmp.position.set(x, 0.101, -0.985);
    tmp.rotation.set(0, 0, 0);
    tmp.updateMatrix();
    rearSlots.setMatrixAt(i, tmp.matrix);
  }
  rearSlots.instanceMatrix.needsUpdate = true;
  root.add(rearSlots);

  // Top rear ventilation areas with slot pattern (more realistic than visible fan props)
  const topVentPanelGeo = useGeometry(new RoundedBoxGeometry(0.78, 0.01, 0.34, 4, 0.01));
  const topVentLeft = new THREE.Mesh(topVentPanelGeo, darkMat);
  topVentLeft.position.set(-0.69, 0.106, -0.66);
  root.add(topVentLeft);
  const topVentRight = topVentLeft.clone();
  topVentRight.position.x = 0.69;
  root.add(topVentRight);

  const topVentSlotGeo = useGeometry(new THREE.BoxGeometry(0.58, 0.0025, 0.012));
  const topVentSlots = new THREE.InstancedMesh(topVentSlotGeo, portMat, 28);
  for (let i = 0; i < 28; i++) {
    const side = i < 14 ? -1 : 1;
    const row = i % 14;
    tmp.position.set(side * 0.69, 0.109, -0.79 + row * 0.02);
    tmp.rotation.set(0, 0, 0);
    tmp.updateMatrix();
    topVentSlots.setMatrixAt(i, tmp.matrix);
  }
  topVentSlots.instanceMatrix.needsUpdate = true;
  root.add(topVentSlots);

  const speakerDotGeo = useGeometry(new THREE.CylinderGeometry(0.006, 0.006, 0.003, 10));
  const speakerDots = new THREE.InstancedMesh(speakerDotGeo, portMat, 96);
  let s = 0;
  for (let side = -1; side <= 1; side += 2) {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 12; col++) {
        tmp.position.set(side * 1.34, 0.102, -0.55 + col * 0.11 + row * 0.004);
        tmp.rotation.set(Math.PI * 0.5, 0, 0);
        tmp.updateMatrix();
        speakerDots.setMatrixAt(s, tmp.matrix);
        s += 1;
      }
    }
  }
  speakerDots.instanceMatrix.needsUpdate = true;
  root.add(speakerDots);

  const sideVentGeo = useGeometry(new THREE.BoxGeometry(0.01, 0.007, 0.06));
  const sideVents = new THREE.InstancedMesh(sideVentGeo, portMat, 56);
  for (let i = 0; i < 28; i++) {
    const z = -0.78 + i * 0.055;
    tmp.position.set(-1.706, 0.054, z);
    tmp.rotation.set(0, 0, 0);
    tmp.updateMatrix();
    sideVents.setMatrixAt(i, tmp.matrix);

    tmp.position.set(1.706, 0.054, z);
    tmp.rotation.set(0, 0, 0);
    tmp.updateMatrix();
    sideVents.setMatrixAt(i + 28, tmp.matrix);
  }
  sideVents.instanceMatrix.needsUpdate = true;
  root.add(sideVents);

  const footGeo = useGeometry(new RoundedBoxGeometry(0.42, 0.012, 0.18, 2, 0.006));
  const feet = new THREE.InstancedMesh(footGeo, rubberMat, 4);
  const footPositions = [
    [-1.1, -0.03, -0.7],
    [1.1, -0.03, -0.7],
    [-1.1, -0.03, 0.82],
    [1.1, -0.03, 0.82],
  ];
  for (let i = 0; i < footPositions.length; i++) {
    tmp.position.set(footPositions[i][0], footPositions[i][1], footPositions[i][2]);
    tmp.rotation.set(0, 0, 0);
    tmp.updateMatrix();
    feet.setMatrixAt(i, tmp.matrix);
  }
  feet.instanceMatrix.needsUpdate = true;
  root.add(feet);

  const hinge = new THREE.Mesh(useGeometry(new THREE.CylinderGeometry(0.028, 0.028, 2.36, 28)), darkMat);
  hinge.rotation.z = Math.PI * 0.5;
  hinge.position.set(0, 0.086, -1.04);
  root.add(hinge);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.086, -1.04);
  lidPivot.rotation.x = -0.37;
  root.add(lidPivot);

  const lidBack = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(3.2, 2.0, 0.062, 6, 0.028)), shellMat);
  lidBack.position.set(0, 0.97, -0.01);
  lidPivot.add(lidBack);

  const bezel = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(3.04, 1.84, 0.028, 5, 0.012)), bezelMat);
  bezel.position.set(0, 0.97, 0.026);
  lidPivot.add(bezel);

  const panel = new THREE.Mesh(useGeometry(new THREE.PlaneGeometry(2.9, 1.66)), panelMat);
  panel.position.set(0, 0.97, 0.045);
  lidPivot.add(panel);

  const panelGlass = new THREE.Mesh(useGeometry(new THREE.PlaneGeometry(2.9, 1.66)), glassMat);
  panelGlass.position.set(0, 0.97, 0.052);
  lidPivot.add(panelGlass);

  const camDot = new THREE.Mesh(useGeometry(new THREE.CircleGeometry(0.013, 16)), darkMat);
  camDot.position.set(0, 1.79, 0.054);
  lidPivot.add(camDot);

  const shadow = new THREE.Mesh(useGeometry(new THREE.PlaneGeometry(4.2, 2.7)), shadowMat);
  shadow.rotation.x = -Math.PI * 0.5;
  shadow.position.y = -0.11;
  root.add(shadow);

  const underGlow = new THREE.Mesh(useGeometry(new THREE.PlaneGeometry(2.8, 0.48)), underGlowMat);
  underGlow.rotation.x = -Math.PI * 0.5;
  underGlow.position.set(0, -0.07, 1.01);
  root.add(underGlow);

  return {
    root,
    lidPivot,
    panel,
    panelGlass,
    keys,
    keyRows,
    keyCols,
    keyboardMat,
    panelMat,
    ledMat,
    underGlowMat,
    materials,
    geometries,
  };
}

function createMousePadAccessory() {
  const group = new THREE.Group();
  const materials = [];
  const geometries = [];

  const useMaterial = (material) => {
    materials.push(material);
    return material;
  };

  const useGeometry = (geometry) => {
    geometries.push(geometry);
    return geometry;
  };

  const padMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x0a101a,
      metalness: 0.04,
      roughness: 0.95,
    })
  );

  const topMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x0f1726,
      metalness: 0.06,
      roughness: 0.82,
    })
  );

  const edgeMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x8cd8ff,
      emissive: new THREE.Color(0x2ec8ff),
      emissiveIntensity: 0.72,
      metalness: 0.02,
      roughness: 0.28,
      transparent: true,
      opacity: 0.74,
    })
  );

  const glowTexture = createSoftCircleTexture('rgba(255,255,255,0.95)', 'rgba(255,255,255,0)', 256);
  const glowMat = useMaterial(
    new THREE.MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x2ec8ff,
    })
  );

  const base = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(1.16, 0.03, 0.92, 5, 0.05)), padMat);
  group.add(base);

  const top = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(1.08, 0.006, 0.84, 5, 0.045)), topMat);
  top.position.y = 0.016;
  group.add(top);

  const edgeFront = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(1.02, 0.008, 0.012, 4, 0.004)), edgeMat);
  edgeFront.position.set(0, 0.012, 0.416);
  group.add(edgeFront);

  const edgeLeft = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(0.012, 0.008, 0.76, 4, 0.004)), edgeMat);
  edgeLeft.position.set(-0.514, 0.012, 0);
  group.add(edgeLeft);

  const edgeRight = edgeLeft.clone();
  edgeRight.position.x = 0.514;
  group.add(edgeRight);

  const glow = new THREE.Mesh(useGeometry(new THREE.PlaneGeometry(1.2, 0.95)), glowMat);
  glow.rotation.x = -Math.PI * 0.5;
  glow.position.set(0, -0.016, 0);
  group.add(glow);

  group.scale.setScalar(0.001);

  return { group, edgeMat, glowMat, materials, geometries, glowTexture };
}

function createMouseAccessory() {
  const group = new THREE.Group();
  const materials = [];
  const geometries = [];

  const useMaterial = (material) => {
    materials.push(material);
    return material;
  };

  const useGeometry = (geometry) => {
    geometries.push(geometry);
    return geometry;
  };

  const shellMat = useMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x12161f,
      metalness: 0.18,
      roughness: 0.52,
      clearcoat: 0.22,
      clearcoatRoughness: 0.5,
    })
  );

  const shellTopMat = useMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x1a202b,
      metalness: 0.16,
      roughness: 0.42,
      clearcoat: 0.3,
      clearcoatRoughness: 0.38,
    })
  );

  const gripMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x0b0f17,
      metalness: 0.04,
      roughness: 0.9,
    })
  );

  const wheelMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x0b0f16,
      metalness: 0.06,
      roughness: 0.92,
    })
  );

  const sideLedMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0xa7ecff,
      emissive: new THREE.Color(0x2ec8ff),
      emissiveIntensity: 0.78,
      metalness: 0.02,
      roughness: 0.3,
      transparent: true,
      opacity: 0.82,
    })
  );

  const accentMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x2b313d,
      metalness: 0.34,
      roughness: 0.4,
    })
  );

  const glowTexture = createSoftCircleTexture('rgba(255,255,255,0.96)', 'rgba(255,255,255,0)', 256);
  const glowMat = useMaterial(
    new THREE.MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0.36,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x2ec8ff,
    })
  );

  const baseBody = new THREE.Mesh(useGeometry(new THREE.CapsuleGeometry(0.23, 0.55, 10, 30)), shellMat);
  baseBody.rotation.x = Math.PI * 0.5;
  baseBody.scale.set(1.06, 0.38, 1);
  baseBody.position.y = 0.024;
  group.add(baseBody);

  const topShell = new THREE.Mesh(useGeometry(new THREE.CapsuleGeometry(0.2, 0.4, 10, 26)), shellTopMat);
  topShell.rotation.x = Math.PI * 0.5;
  topShell.scale.set(0.92, 0.29, 0.86);
  topShell.position.set(0, 0.075, -0.03);
  group.add(topShell);

  const leftButton = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(0.194, 0.026, 0.36, 4, 0.024)), shellTopMat);
  leftButton.position.set(-0.103, 0.11, -0.2);
  group.add(leftButton);
  const rightButton = leftButton.clone();
  rightButton.position.x = 0.103;
  group.add(rightButton);

  const wheel = new THREE.Mesh(useGeometry(new THREE.CylinderGeometry(0.036, 0.036, 0.08, 24)), wheelMat);
  wheel.rotation.x = Math.PI * 0.5;
  wheel.position.set(0, 0.113, -0.168);
  group.add(wheel);

  const wheelCut = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(0.1, 0.018, 0.16, 3, 0.008)), accentMat);
  wheelCut.position.set(0, 0.103, -0.166);
  group.add(wheelCut);

  const splitLine = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(0.007, 0.014, 0.5, 3, 0.004)), accentMat);
  splitLine.position.set(0, 0.096, -0.02);
  group.add(splitLine);

  const lowerShell = new THREE.Mesh(useGeometry(new THREE.CapsuleGeometry(0.2, 0.44, 8, 22)), gripMat);
  lowerShell.rotation.x = Math.PI * 0.5;
  lowerShell.scale.set(1, 0.2, 0.84);
  lowerShell.position.set(0, -0.015, 0.02);
  group.add(lowerShell);

  const leftGrip = new THREE.Mesh(useGeometry(new THREE.CapsuleGeometry(0.056, 0.26, 6, 14)), gripMat);
  leftGrip.rotation.set(Math.PI * 0.5, 0, Math.PI * 0.16);
  leftGrip.scale.set(0.7, 0.2, 0.95);
  leftGrip.position.set(-0.255, 0.036, 0.07);
  group.add(leftGrip);

  const rightGrip = leftGrip.clone();
  rightGrip.position.x = 0.255;
  rightGrip.rotation.z = -Math.PI * 0.16;
  group.add(rightGrip);

  const sideButtonGeo = useGeometry(new RoundedBoxGeometry(0.062, 0.018, 0.1, 3, 0.01));
  const sideBtnA = new THREE.Mesh(sideButtonGeo, accentMat);
  sideBtnA.position.set(-0.242, 0.072, -0.065);
  sideBtnA.rotation.y = -0.1;
  group.add(sideBtnA);
  const sideBtnB = sideBtnA.clone();
  sideBtnB.position.z = 0.04;
  group.add(sideBtnB);

  const ledStrip = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(0.17, 0.009, 0.04, 3, 0.008)), sideLedMat);
  ledStrip.position.set(0, 0.045, 0.24);
  group.add(ledStrip);

  const ledTail = new THREE.Mesh(useGeometry(new THREE.TorusGeometry(0.048, 0.006, 6, 24)), sideLedMat);
  ledTail.rotation.x = Math.PI * 0.5;
  ledTail.position.set(0, 0.062, 0.23);
  group.add(ledTail);

  const glow = new THREE.Mesh(useGeometry(new THREE.PlaneGeometry(0.62, 0.34)), glowMat);
  glow.rotation.x = -Math.PI * 0.5;
  glow.position.set(0, -0.058, 0.14);
  group.add(glow);

  const footGeo = useGeometry(new RoundedBoxGeometry(0.11, 0.006, 0.055, 2, 0.003));
  const feet = new THREE.InstancedMesh(footGeo, accentMat, 4);
  const footDummy = new THREE.Object3D();
  const footPos = [
    [-0.115, -0.035, -0.22],
    [0.115, -0.035, -0.22],
    [-0.105, -0.035, 0.24],
    [0.105, -0.035, 0.24],
  ];
  for (let i = 0; i < footPos.length; i++) {
    footDummy.position.set(footPos[i][0], footPos[i][1], footPos[i][2]);
    footDummy.rotation.set(0, 0, 0);
    footDummy.updateMatrix();
    feet.setMatrixAt(i, footDummy.matrix);
  }
  feet.instanceMatrix.needsUpdate = true;
  group.add(feet);

  group.scale.setScalar(0.001);

  return { group, wheel, sideLedMat, glowMat, materials, geometries, glowTexture };
}

export function initThreeScene() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let prefersReducedMotion = reducedMotionQuery.matches;

  const isMobile = window.innerWidth < 920;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.05);

  const scene = new THREE.Scene();
  scene.environment = envRT.texture;
  scene.fog = new THREE.Fog(0x090b13, 9, 26);

  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 90);
  camera.position.set(0.18, 1.08, 7.12);

  scene.add(new THREE.AmbientLight(0xffffff, 0.28));

  const hemi = new THREE.HemisphereLight(0x9db8ff, 0x080a12, 0.35);
  hemi.position.set(0, 8, 0);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(4.8, 4.2, 5.2);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x7aa4ff, 0.34);
  fill.position.set(-4.2, 1.2, 2.4);
  scene.add(fill);

  const rim = new THREE.PointLight(0xc084fc, 0.7, 24, 2.1);
  rim.position.set(-3.2, 1.9, -3.5);
  scene.add(rim);

  const starTexture = createStarTexture();
  const shadowTexture = createSoftCircleTexture('rgba(0,0,0,0.95)', 'rgba(0,0,0,0)', 512);
  const glowTexture = createSoftCircleTexture('rgba(255,255,255,0.95)', 'rgba(255,255,255,0)', 512);
  const screenDisplay = createScreenTexture();

  const laptop = createLaptopModel({
    screen: screenDisplay,
    shadow: shadowTexture,
    glow: glowTexture,
  });
  scene.add(laptop.root);

  const gltfLoader = new GLTFLoader();
  let isDestroyed = false;
  const accessoryCarrier = new THREE.Group();

  let mousePadAccessory = createMousePadAccessory();
  accessoryCarrier.add(mousePadAccessory.group);

  let mouseAccessory = createMouseAccessory();
  accessoryCarrier.add(mouseAccessory.group);

  loadAccessoryModel(gltfLoader, mousePadModelUrl, {
    targetMaxSize: 1.56,
    yOffset: 0,
    roughnessMul: 0.9,
    metalnessBoost: 0.03,
    envMapIntensity: 1.1,
    glowColor: 0x2ec8ff,
    glowOpacity: 0.22,
    glowPlane: [1.72, 1.28],
    autoFlat: true,
    longAxis: 'z',
    modelOffset: [0, -0.01, 0],
  })
    .then((loadedPad) => {
      if (isDestroyed) {
        disposeAccessoryResources(loadedPad);
        return;
      }
      accessoryCarrier.remove(mousePadAccessory.group);
      disposeAccessoryResources(mousePadAccessory);
      mousePadAccessory = loadedPad;
      accessoryCarrier.add(mousePadAccessory.group);
    })
    .catch((error) => {
      console.warn('[three-scene] mouse pad GLB load failed, using fallback.', error);
    });

  loadAccessoryModel(gltfLoader, mouseModelUrl, {
    targetMaxSize: 0.76,
    yOffset: 0,
    roughnessMul: 0.84,
    metalnessBoost: 0.02,
    envMapIntensity: 1.18,
    glowColor: 0x39d2ff,
    glowOpacity: 0.18,
    glowPlane: [0.68, 0.42],
    autoFlat: true,
    longAxis: 'z',
  })
    .then((loadedMouse) => {
      if (isDestroyed) {
        disposeAccessoryResources(loadedMouse);
        return;
      }
      accessoryCarrier.remove(mouseAccessory.group);
      disposeAccessoryResources(mouseAccessory);
      mouseAccessory = loadedMouse;
      accessoryCarrier.add(mouseAccessory.group);
    })
    .catch((error) => {
      console.warn('[three-scene] mouse GLB load failed, using fallback.', error);
    });

  const baseX = isMobile ? 0.56 : 3.98;
  laptop.root.position.set(baseX, 0.14, -0.4);
  laptop.root.add(accessoryCarrier);

  const layerConfig = prefersReducedMotion
    ? [
        { count: isMobile ? 200 : 280, spreadX: 42, spreadY: 24, depth: 22, size: 0.05, opacity: 0.16, parallax: 0.16, speed: 0.02 },
        { count: isMobile ? 130 : 190, spreadX: 32, spreadY: 18, depth: 16, size: 0.07, opacity: 0.13, parallax: 0.24, speed: 0.028 },
      ]
    : [
        { count: isMobile ? 320 : 500, spreadX: 46, spreadY: 26, depth: 28, size: 0.045, opacity: 0.19, parallax: 0.12, speed: 0.024 },
        { count: isMobile ? 220 : 360, spreadX: 36, spreadY: 20, depth: 20, size: 0.062, opacity: 0.15, parallax: 0.22, speed: 0.032 },
        { count: isMobile ? 100 : 180, spreadX: 26, spreadY: 15, depth: 12, size: 0.085, opacity: 0.12, parallax: 0.32, speed: 0.04 },
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

  function updatePointer(clientX, clientY) {
    state.pointerTargetX = (clientX / window.innerWidth) * 2 - 1;
    state.pointerTargetY = (clientY / window.innerHeight) * 2 - 1;
    state.lastPointerMs = performance.now();
  }

  function onPointerMove(event) {
    if (prefersReducedMotion) return;
    updatePointer(event.clientX, event.clientY);
  }

  function onMouseMove(event) {
    if (prefersReducedMotion) return;
    updatePointer(event.clientX, event.clientY);
  }

  function onPointerDown(event) {
    updatePointer(event.clientX, event.clientY);
    screenDisplay.setFocus(isScreenHit(event.clientX, event.clientY));
  }

  function onTouchStart(event) {
    if (!event.touches || !event.touches[0]) return;
    const touch = event.touches[0];
    updatePointer(touch.clientX, touch.clientY);
    screenDisplay.setFocus(isScreenHit(touch.clientX, touch.clientY));
  }

  function onTouchMove(event) {
    if (prefersReducedMotion) return;
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
    const heroRange = heroSection ? Math.max(heroSection.offsetHeight * 1.9, window.innerHeight * 1.9) : Math.max(window.innerHeight * 1.9, 1200);
    const heroProgress = clamp01((window.scrollY - heroStart) / heroRange);
    const viewportKick = clamp01(window.scrollY / Math.max(window.innerHeight * 1.5, 980));

    state.scrollTarget = clamp01(Math.max(globalProgress * 0.26, heroProgress, viewportKick * 0.5));
  }

  function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function onReducedMotionChange(event) {
    prefersReducedMotion = event.matches;
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
    rafId = requestAnimationFrame(render);

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    const idleTime = performance.now() - state.lastPointerMs;
    if (idleTime > 900) {
      state.pointerTargetX = damp(state.pointerTargetX, 0, 2.2, dt);
      state.pointerTargetY = damp(state.pointerTargetY, 0, 2.2, dt);
    }

    const motionFactor = prefersReducedMotion ? 0.3 : 1;

    state.pointerX = damp(state.pointerX, state.pointerTargetX, prefersReducedMotion ? 2.8 : 10.2, dt);
    state.pointerY = damp(state.pointerY, state.pointerTargetY, prefersReducedMotion ? 2.8 : 10.2, dt);
    state.scroll = damp(state.scroll, state.scrollTarget, 6, dt);
    const rawVelocity = (state.scroll - state.prevScroll) / Math.max(dt, 1 / 180);
    state.scrollVelocity = damp(state.scrollVelocity, rawVelocity, 9, dt);
    state.prevScroll = state.scroll;

    const pointerCurveX = Math.tanh(state.pointerX * 1.22);
    const pointerCurveY = Math.tanh(state.pointerY * 1.25);

    const basePitch = 0.072 + Math.sin(t * 0.58) * 0.008 * motionFactor;
    const baseYaw = 0.28 + state.scroll * 0.16;
    const baseRoll = Math.sin(t * 0.45) * 0.006 * motionFactor;

    const velocityKick = THREE.MathUtils.clamp(state.scrollVelocity * 0.22, -0.1, 0.1);
    const targetPitch = basePitch - pointerCurveY * 0.09 * motionFactor - velocityKick * 0.18;
    const targetYaw = baseYaw + pointerCurveX * 0.24 * motionFactor;
    const targetRoll = baseRoll - pointerCurveX * 0.032 * motionFactor + velocityKick * 0.14;

    state.rotX = damp(state.rotX, targetPitch, 8.8, dt);
    state.rotY = damp(state.rotY, targetYaw, 8.8, dt);
    state.rotZ = damp(state.rotZ, targetRoll, 7.2, dt);

    laptop.root.rotation.set(state.rotX, state.rotY, state.rotZ);

    const bob = Math.sin(t * 0.9) * 0.062 * motionFactor;
    const sway = Math.sin(t * 0.45 + state.scroll * 1.45) * 0.038 * motionFactor;
    const targetX = baseX + pointerCurveX * 0.29 * motionFactor + sway;
    const targetY = 0.08 + bob - pointerCurveY * 0.05 * motionFactor - state.scroll * 0.22 - velocityKick * 0.04;
    const targetZ = -0.36 - state.scroll * 0.62;

    laptop.root.position.x = damp(laptop.root.position.x, targetX, 6.4, dt);
    laptop.root.position.y = damp(laptop.root.position.y, targetY, 6.4, dt);
    laptop.root.position.z = damp(laptop.root.position.z, targetZ, 6.4, dt);

    const openAngle = -0.47 - state.scroll * 0.05 + Math.sin(t * 0.3) * 0.008 * motionFactor + velocityKick * 0.04;
    laptop.lidPivot.rotation.x = damp(laptop.lidPivot.rotation.x, openAngle, 5, dt);

    const pulse = 0.82 + Math.sin(t * 2.1) * 0.18 + state.scroll * 0.22 + Math.abs(state.scrollVelocity) * 0.08;
    laptop.keyboardMat.emissiveIntensity = 0.38 + pulse * 0.36;
    laptop.panelMat.emissiveIntensity = 0.5 + pulse * 0.24;
    laptop.ledMat.emissiveIntensity = 0.92 + pulse * 0.62;
    laptop.underGlowMat.opacity = 0.24 + pulse * 0.22;

    const ledHue = 0.74 + Math.sin(t * 0.44 + state.scroll * 2.2) * 0.04;
    frontLedColor.setHSL(ledHue, 0.74, 0.66);
    laptop.ledMat.color.copy(frontLedColor);
    laptop.ledMat.emissive.copy(frontLedColor).multiplyScalar(0.54);

    if (!prefersReducedMotion && t - lastKeyboardColorTick > 0.028) {
      lastKeyboardColorTick = t;
      for (let i = 0; i < laptop.keyRows * laptop.keyCols; i++) {
        const row = Math.floor(i / laptop.keyCols);
        const col = i % laptop.keyCols;
        const hue = 0.71 + (col / (laptop.keyCols - 1)) * 0.2 + Math.sin(t * 0.9 + row * 0.62 + state.scroll * 2.4) * 0.024;
        const lightness = 0.49 + Math.sin(t * 1.7 + col * 0.4 + row * 0.2 + state.scroll * 5.2) * 0.08;
        keyboardColor.setHSL((hue % 1 + 1) % 1, 0.74, THREE.MathUtils.clamp(lightness, 0.36, 0.68));
        laptop.keys.setColorAt(i, keyboardColor);
      }
      if (laptop.keys.instanceColor) laptop.keys.instanceColor.needsUpdate = true;
    }

    screenDisplay.update(t, state.scroll, state.scrollVelocity, dt);

    const mousePadReveal = clamp01((state.scroll - 0.015) / 0.12) * (prefersReducedMotion ? 0.72 : 1);
    const mouseReveal = clamp01((state.scroll - 0.16) / 0.16) * (prefersReducedMotion ? 0.65 : 1);

    // Keep accessories rigidly anchored to the laptop so they move exactly with it.
    const carrierTargetX = isMobile ? -5.36 : -2.32;
    const carrierTargetY = -0.074 - state.scroll * 0.01;
    const carrierTargetZ = isMobile ? 0.88 : -0.38;

    accessoryCarrier.position.x = damp(accessoryCarrier.position.x, carrierTargetX, 7.2, dt);
    accessoryCarrier.position.y = damp(accessoryCarrier.position.y, carrierTargetY, 7.2, dt);
    accessoryCarrier.position.z = damp(accessoryCarrier.position.z, carrierTargetZ, 7.2, dt);
    accessoryCarrier.rotation.x = damp(accessoryCarrier.rotation.x, 0, 7.2, dt);
    accessoryCarrier.rotation.y = damp(accessoryCarrier.rotation.y, 0, 7.2, dt);
    accessoryCarrier.rotation.z = damp(accessoryCarrier.rotation.z, 0, 7.2, dt);

    mousePadAccessory.group.position.x = damp(mousePadAccessory.group.position.x, 0, 7.2, dt);
    mousePadAccessory.group.position.y = damp(mousePadAccessory.group.position.y, 0, 7.2, dt);
    mousePadAccessory.group.position.z = damp(mousePadAccessory.group.position.z, 0, 7.2, dt);
    mousePadAccessory.group.rotation.x = damp(mousePadAccessory.group.rotation.x, 0, 7.2, dt);
    mousePadAccessory.group.rotation.y = damp(mousePadAccessory.group.rotation.y, 0, 7.2, dt);
    mousePadAccessory.group.rotation.z = damp(mousePadAccessory.group.rotation.z, 0, 7.2, dt);

    const padScale = 0.001 + mousePadReveal * 1.65;
    mousePadAccessory.group.scale.set(padScale, padScale, padScale);
    if (mousePadAccessory.edgeMat) {
      if ('opacity' in mousePadAccessory.edgeMat) mousePadAccessory.edgeMat.opacity = 0.2 + mousePadReveal * 0.58;
      if ('emissiveIntensity' in mousePadAccessory.edgeMat) {
        mousePadAccessory.edgeMat.emissiveIntensity = 0.34 + mousePadReveal * 0.68 + pulse * 0.16;
      }
    }
    if (mousePadAccessory.glowMat && 'opacity' in mousePadAccessory.glowMat) {
      mousePadAccessory.glowMat.opacity = 0.08 + mousePadReveal * 0.24;
    }

    const mouseLocalX = (isMobile ? 0.08 : 0.01) + (1 - mouseReveal) * -0.06;
    const mouseLocalY = 0.016;
    const mouseLocalZ = 0.01;

    mouseAccessory.group.position.x = damp(mouseAccessory.group.position.x, mouseLocalX, 7.2, dt);
    mouseAccessory.group.position.y = damp(mouseAccessory.group.position.y, mouseLocalY, 7.2, dt);
    mouseAccessory.group.position.z = damp(mouseAccessory.group.position.z, mouseLocalZ, 7.2, dt);

    const mouseScale = 0.001 + mouseReveal * 0.92;
    mouseAccessory.group.scale.setScalar(mouseScale);
    mouseAccessory.group.rotation.x = damp(mouseAccessory.group.rotation.x, 0.01, 7.2, dt);
    mouseAccessory.group.rotation.y = damp(mouseAccessory.group.rotation.y, Math.PI + 0.06, 7.2, dt);
    mouseAccessory.group.rotation.z = damp(mouseAccessory.group.rotation.z, 0.015, 7.2, dt);
    if (mouseAccessory.wheel && mouseAccessory.wheel.rotation) {
      mouseAccessory.wheel.rotation.z += (1.1 + state.scroll * 7 + Math.abs(state.scrollVelocity) * 4) * dt;
    }
    if (mouseAccessory.sideLedMat) {
      if ('opacity' in mouseAccessory.sideLedMat) mouseAccessory.sideLedMat.opacity = 0.22 + mouseReveal * 0.7;
      if ('emissiveIntensity' in mouseAccessory.sideLedMat) {
        mouseAccessory.sideLedMat.emissiveIntensity = 0.7 + mouseReveal * 0.95 + pulse * 0.25;
      }
    }
    if (mouseAccessory.glowMat && 'opacity' in mouseAccessory.glowMat) {
      mouseAccessory.glowMat.opacity = 0.12 + mouseReveal * 0.45;
    }

    const camTargetX = (pointerCurveX * 0.34 + (isMobile ? 0.08 : 0.16) + state.scroll * 0.05) * motionFactor;
    const camTargetY = (0.94 - pointerCurveY * 0.08 - state.scroll * 0.06) * motionFactor + (1 - motionFactor) * 0.28;
    const camTargetZ = 7.08 + state.scroll * 0.2;

    camera.position.x = damp(camera.position.x, camTargetX, 4.7, dt);
    camera.position.y = damp(camera.position.y, camTargetY, 4.7, dt);
    camera.position.z = damp(camera.position.z, camTargetZ, 4.2, dt);
    camera.lookAt(baseX * 0.38, 0.36 - state.scroll * 0.05, -0.08);

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

    renderer.render(scene, camera);
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
    disposeAccessoryResources(mousePadAccessory);
    disposeAccessoryResources(mouseAccessory);

    starTexture.dispose();
    shadowTexture.dispose();
    glowTexture.dispose();
    screenDisplay.texture.dispose();

    envRT.dispose();
    pmrem.dispose();
    renderer.dispose();
  };
}
