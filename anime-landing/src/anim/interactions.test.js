import { test, describe, mock } from 'node:test';
import assert from 'node:assert';
import { bindPointerParallax, bindCardHover, burst } from './interactions.js';

describe('interactions', () => {
  test('bindCardHover sets CSS variables from pointer position', () => {
    const card = {
      listeners: {},
      addEventListener(event, callback) {
        this.listeners[event] = callback;
      },
      getBoundingClientRect() {
        return { left: 10, top: 20 };
      },
      style: {
        properties: {},
        setProperty(name, value) {
          this.properties[name] = value;
        },
      },
    };

    bindCardHover([card]);
    card.listeners.pointermove({ clientX: 50, clientY: 100 });

    assert.strictEqual(card.style.properties['--mx'], '40px');
    assert.strictEqual(card.style.properties['--my'], '80px');
  });

  test('bindPointerParallax registers listeners and animates with injected function', () => {
    const originalWindow = global.window;
    const addEventListener = mock.fn();
    const removeEventListener = mock.fn();
    global.window = {
      innerWidth: 1024,
      innerHeight: 768,
      addEventListener,
      removeEventListener,
    };

    try {
      const orb = { group: { rotation: { x: 0, y: 0 } } };
      const state = { pointerX: 0, pointerY: 0 };
      const animateMock = mock.fn();

      const cleanup = bindPointerParallax({ orb, state, animate: animateMock });

      assert.strictEqual(addEventListener.mock.calls.length, 1);
      assert.strictEqual(addEventListener.mock.calls[0].arguments[0], 'pointermove');
      assert.strictEqual(animateMock.mock.calls.length, 1);
      assert.strictEqual(animateMock.mock.calls[0].arguments[0], state);

      const onMove = addEventListener.mock.calls[0].arguments[1];
      onMove({ clientX: 512, clientY: 384 });
      assert.strictEqual(state.pointerX, 0);
      assert.strictEqual(state.pointerY, 0);

      state.pointerX = 1;
      state.pointerY = 1;
      const animationConfig = animateMock.mock.calls[0].arguments[1];
      animationConfig.onUpdate();
      assert.ok(orb.group.rotation.x < 0);
      assert.ok(orb.group.rotation.y > 0);

      cleanup();
      assert.strictEqual(removeEventListener.mock.calls.length, 1);
    } finally {
      global.window = originalWindow;
    }
  });

  test('burst supports injected animate function in options and second arg', () => {
    const orb = {
      ringMat: { opacity: 0 },
      coreMat: { emissive: { r: 0, g: 0, b: 0 } },
      group: { position: { z: 0 }, rotation: { z: 0 } },
    };
    const state = { shake: 0 };

    const animateFromOptions = mock.fn();
    burst({ orb, state, animate: animateFromOptions });
    assert.strictEqual(animateFromOptions.mock.calls.length, 4);

    const animateFromSecondArg = mock.fn();
    burst({ orb, state }, animateFromSecondArg);
    assert.strictEqual(animateFromSecondArg.mock.calls.length, 4);

    const config = animateFromSecondArg.mock.calls[3].arguments[1];
    assert.strictEqual(typeof config.onUpdate, 'function');
    assert.strictEqual(typeof config.onComplete, 'function');
  });
});
