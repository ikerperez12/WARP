import { test } from 'node:test';
import assert from 'node:assert';
import { initThreeScene } from '../src/three-scene.js';

test('initThreeScene handles missing canvas gracefully', () => {
  const originalDocument = global.document;
  global.document = {
    getElementById: () => null,
  };

  try {
    const cleanup = initThreeScene();
    assert.strictEqual(typeof cleanup, 'function');
    cleanup();
  } finally {
    global.document = originalDocument;
  }
});
