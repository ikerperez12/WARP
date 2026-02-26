import { test, describe, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { bindPointerParallax, bindCardHover, burst } from './interactions.js';

// --- Minimal DOM Mock ---
class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.style = {
      setProperty: mock.fn(),
    };
    this.listeners = {};
    this.rect = { left: 0, top: 0, width: 100, height: 100 };
  }

  addEventListener(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    }
  }

  dispatchEvent(event) {
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach(handler => handler(event));
    }
  }

  getBoundingClientRect() {
    return this.rect;
  }
}

// Setup global window/document
const originalWindow = global.window;
const originalDocument = global.document;

function setupGlobals() {
  global.window = {
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: mock.fn(),
    removeEventListener: mock.fn(),
  };
  global.document = {
    createElement: (tag) => new MockElement(tag),
  };
}

function teardownGlobals() {
  global.window = originalWindow;
  global.document = originalDocument;
}

// --- Tests ---

describe('interactions.js', () => {
  beforeEach(setupGlobals);
  afterEach(teardownGlobals);

  describe('bindPointerParallax', () => {
    test('should bind pointermove listener and start animation', () => {
      const orb = { group: { rotation: { x: 0, y: 0 } } };
      const state = { pointerX: 0, pointerY: 0 };
      const animateMock = mock.fn();

      const cleanup = bindPointerParallax({ orb, state, animate: animateMock });

      // Verify listener binding
      assert.strictEqual(global.window.addEventListener.mock.calls.length, 1);
      assert.strictEqual(global.window.addEventListener.mock.calls[0].arguments[0], 'pointermove');

      // Verify animation start
      assert.strictEqual(animateMock.mock.calls.length, 1);
      const [target, config] = animateMock.mock.calls[0].arguments;
      assert.strictEqual(target, state);
      assert.strictEqual(config.loop, true);
      assert.strictEqual(typeof config.onUpdate, 'function');

      // Verify cleanup
      cleanup();
      assert.strictEqual(global.window.removeEventListener.mock.calls.length, 1);
    });

    test('should update state on pointer move', () => {
      const orb = { group: { rotation: { x: 0, y: 0 } } };
      const state = { pointerX: 0, pointerY: 0 };
      const animateMock = mock.fn();

      // We need to capture the event handler
      let moveHandler;
      global.window.addEventListener = mock.fn((event, handler) => {
        if (event === 'pointermove') moveHandler = handler;
      });

      bindPointerParallax({ orb, state, animate: animateMock });

      assert.ok(moveHandler, 'Handler should be captured');

      // Simulate move to center (should be 0, 0 in normalized coords)
      // clientX = innerWidth / 2 = 512 -> (512/1024)*2 - 1 = 0
      moveHandler({ clientX: 512, clientY: 384 });
      assert.strictEqual(state.pointerX, 0);
      assert.strictEqual(state.pointerY, 0);

      // Simulate move to top-left (should be -1, -1)
      moveHandler({ clientX: 0, clientY: 0 });
      assert.strictEqual(state.pointerX, -1);
      assert.strictEqual(state.pointerY, -1);
    });

    test('animation update should modify orb rotation', () => {
      const orb = { group: { rotation: { x: 0, y: 0 } } };
      const state = { pointerX: 1, pointerY: 1 }; // Bottom-right
      let onUpdateCallback;
      const animateMock = mock.fn((t, config) => {
        onUpdateCallback = config.onUpdate;
      });

      bindPointerParallax({ orb, state, animate: animateMock });

      // Run one update frame
      // Target TX = -1 * 0.18 = -0.18
      // Target TY = 1 * 0.28 = 0.28
      // Lerp factor 0.05
      // New X = 0 + (-0.18 - 0) * 0.05 = -0.009
      // New Y = 0 + (0.28 - 0) * 0.05 = 0.014
      onUpdateCallback();

      assert.ok(orb.group.rotation.x < 0);
      assert.ok(orb.group.rotation.y > 0);
    });
  });

  describe('bindCardHover', () => {
    test('should bind pointermove to cards and update CSS vars', () => {
      const card = new MockElement('div');
      const cards = [card];

      bindCardHover(cards);

      assert.ok(card.listeners['pointermove'], 'Should have pointermove listener');

      // Trigger event
      // Card rect is at 0,0. clientX=50, clientY=50 -> x=50, y=50
      const handler = card.listeners['pointermove'][0];
      handler({ clientX: 50, clientY: 50 });

      assert.strictEqual(card.style.setProperty.mock.calls.length, 2);
      // Check calls arguments
      // We can't easily check strict order without more complex assertions, but let's check content
      const calls = card.style.setProperty.mock.calls.map(c => c.arguments);
      const mxCall = calls.find(args => args[0] === '--mx');
      const myCall = calls.find(args => args[0] === '--my');

      assert.strictEqual(mxCall[1], '50px');
      assert.strictEqual(myCall[1], '50px');
    });
  });

  describe('burst', () => {
    test('should trigger multiple animations', () => {
      const orb = {
        ringMat: { opacity: 0 },
        coreMat: { emissive: { r:0, g:0, b:0 } },
        group: { position: { z: 0 }, rotation: { z: 0 } }
      };
      const state = { shake: 0 };
      const animateMock = mock.fn();

      burst({ orb, state, animate: animateMock });

      // Should call animate 4 times (ringMat, group.pos, coreMat, state)
      assert.strictEqual(animateMock.mock.calls.length, 4);
    });
  });
});
