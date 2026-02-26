import { test, mock } from 'node:test';
import assert from 'node:assert';

// Recursive proxy to mock Three.js objects and methods
const noop = function () { return recursiveProxy; };
const recursiveProxy = new Proxy(noop, {
  get: (target, prop) => {
    if (prop === 'then') return undefined; // Avoid promise resolution
    if (prop === Symbol.iterator) return function* () {}; // Allow iteration
    if (prop === 'Symbol(Symbol.iterator)') return function* () {};
    if (prop === Symbol.toPrimitive) return () => 0;
    if (prop === 'valueOf') return () => 0;
    if (prop === 'toString') return () => '0';
    if (prop === 'x' || prop === 'y' || prop === 'z' || prop === 'r' || prop === 'g' || prop === 'b') return 0;
    // Special handling for properties that might be accessed as values
    return recursiveProxy;
  },
  apply: (target, thisArg, args) => {
    return recursiveProxy;
  },
  construct: (target, args) => {
    return recursiveProxy;
  },
  set: (target, prop, value) => {
    return true;
  }
});

// Mock browser globals
global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  scrollY: 0,
  devicePixelRatio: 1,
  matchMedia: () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }),
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  requestAnimationFrame: (cb) => {
      // Return a dummy ID but don't schedule a real timeout to avoid open handles/timeouts in tests
      return 123;
  },
  cancelAnimationFrame: (id) => {
      // No-op
  },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
};

global.document = {
  getElementById: (id) => null,
  createElement: (tag) => {
    return {
      getContext: () => ({
        createRadialGradient: () => ({ addColorStop: () => {} }),
        createLinearGradient: () => ({ addColorStop: () => {} }),
        fillRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        quadraticCurveTo: () => {},
        closePath: () => {},
        fill: () => {},
        stroke: () => {},
        save: () => {},
        restore: () => {},
        clip: () => {},
        measureText: () => ({ width: 0 }),
        fillText: () => {},
        strokeRect: () => {},
        arc: () => {},
        drawImage: () => {},
        clearRect: () => {},
      }),
      width: 0,
      height: 0,
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  },
  body: {
    dataset: {},
  },
  documentElement: {
    scrollTop: 0,
    scrollHeight: 1000,
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  hidden: false,
};

global.requestAnimationFrame = global.window.requestAnimationFrame;
global.cancelAnimationFrame = global.window.cancelAnimationFrame;
global.performance = { now: () => Date.now() };
global.Image = class {};
global.HTMLElement = class {};
global.HTMLCanvasElement = class {};


// List of exports to mock from 'three'
const threeExports = [
  'WebGLRenderer', 'PMREMGenerator', 'Scene', 'PerspectiveCamera',
  'AmbientLight', 'HemisphereLight', 'DirectionalLight', 'PointLight',
  'CanvasTexture', 'Fog', 'Vector3', 'Vector2', 'Raycaster', 'Clock', 'Color',
  'Group', 'Mesh', 'MeshPhysicalMaterial', 'MeshStandardMaterial',
  'MeshBasicMaterial', 'PointsMaterial', 'BufferGeometry', 'BoxGeometry',
  'CylinderGeometry', 'PlaneGeometry', 'RingGeometry', 'CircleGeometry',
  'BufferAttribute', 'Points', 'InstancedMesh', 'Object3D', 'TextureLoader',
  'MathUtils'
];

const mockThree = {};
threeExports.forEach(exp => {
    mockThree[exp] = recursiveProxy;
});

// Special handling for enums/constants
mockThree.SRGBColorSpace = 'srgb';
mockThree.ACESFilmicToneMapping = 'acesfilmic';
mockThree.MathUtils = { clamp: (v, min, max) => Math.max(min, Math.min(v, max)) };

mock.module('three', {
    namedExports: mockThree
});

mock.module('three/examples/jsm/geometries/RoundedBoxGeometry.js', {
    namedExports: {
        RoundedBoxGeometry: recursiveProxy
    }
});
mock.module('three/examples/jsm/environments/RoomEnvironment.js', {
    namedExports: {
        RoomEnvironment: recursiveProxy
    }
});


test('initThreeScene integration smoke tests', async (t) => {
    // Import after mocking
    const { initThreeScene } = await import('../src/three-scene.js');

    await t.test('handles missing canvas gracefully', () => {
        const cleanup = initThreeScene();
        assert.strictEqual(typeof cleanup, 'function');
        cleanup();
    });

    await t.test('initializes with canvas without crashing', () => {
        // Setup document.getElementById to return a canvas
        const originalGetElementById = global.document.getElementById;
        global.document.getElementById = (id) => {
            if (id === 'three-canvas') {
                return {
                    style: {},
                    addEventListener: () => {},
                    removeEventListener: () => {},
                    width: 800,
                    height: 600,
                    dataset: {},
                };
            }
            return null;
        };

        const cleanup = initThreeScene();
        assert.strictEqual(typeof cleanup, 'function');

        // Verify cleanup works without error
        cleanup();

        // Restore
        global.document.getElementById = originalGetElementById;
    });
});
