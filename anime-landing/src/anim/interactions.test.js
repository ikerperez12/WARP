import { test, describe, mock } from 'node:test';
import assert from 'node:assert';
import { burst } from './interactions.js';

describe('burst', () => {
  test('should trigger animations for orb properties and state', () => {
    // Create a mock animate function
    const animateMock = mock.fn();

    const orb = {
      ringMat: {},
      coreMat: { emissive: { r: 0, g: 0, b: 0 } },
      group: {
        position: { z: 0 },
        rotation: { z: 0 }
      }
    };
    const state = { shake: 0 };

    // Inject the mock via the second argument
    burst({ orb, state }, animateMock);

    // Verify animate was called 4 times
    assert.strictEqual(animateMock.mock.calls.length, 4, 'animate should be called 4 times');

    // 1. ringMat animation
    const call1 = animateMock.mock.calls[0];
    assert.strictEqual(call1.arguments[0], orb.ringMat);
    assert.deepStrictEqual(call1.arguments[1], {
      opacity: [0.45, 0.95],
      duration: 180,
      direction: "alternate",
      ease: "out(3)",
    });

    // 2. group.position animation
    const call2 = animateMock.mock.calls[1];
    assert.strictEqual(call2.arguments[0], orb.group.position);
    assert.deepStrictEqual(call2.arguments[1], {
      z: [0, 0.25],
      duration: 220,
      direction: "alternate",
      ease: "out(3)",
    });

    // 3. coreMat.emissive animation
    const call3 = animateMock.mock.calls[2];
    assert.strictEqual(call3.arguments[0], orb.coreMat.emissive);
    assert.deepStrictEqual(call3.arguments[1], {
      r: [0.07, 0.22],
      g: [0.07, 0.22],
      b: [0.07, 0.22],
      duration: 220,
      direction: "alternate",
      ease: "out(3)",
    });

    // 4. state animation (shake)
    const call4 = animateMock.mock.calls[3];
    assert.strictEqual(call4.arguments[0], state);

    const stateAnimationParams = call4.arguments[1];
    assert.deepStrictEqual(stateAnimationParams.shake, [0, 1]);
    assert.strictEqual(stateAnimationParams.duration, 260);
    assert.strictEqual(stateAnimationParams.direction, "alternate");
    assert.strictEqual(stateAnimationParams.ease, "out(3)");
    assert.strictEqual(typeof stateAnimationParams.onUpdate, 'function');
    assert.strictEqual(typeof stateAnimationParams.onComplete, 'function');

    // Test onUpdate callback logic
    // Wrap in try-finally to ensure Math.random is restored even if assertions fail
    const originalRandom = Math.random;
    try {
        // Set random to return 0.8
        // (0.8 - 0.5) = 0.3
        // 0.3 * 0.08 = 0.024
        // 0.024 * state.shake (which we simulate as 1)
        Math.random = () => 0.8;

        state.shake = 1; // Simulate state being updated by animation to 1
        stateAnimationParams.onUpdate();

        assert.ok(Math.abs(orb.group.rotation.z - 0.024) < 0.0001, `Expected rotation z to be close to 0.024, but got ${orb.group.rotation.z}`);

        // Test onComplete callback logic
        stateAnimationParams.onComplete();
        assert.strictEqual(orb.group.rotation.z, 0, 'Rotation z should be reset to 0 on complete');
    } finally {
        // Restore Math.random
        Math.random = originalRandom;
    }
  });
});
