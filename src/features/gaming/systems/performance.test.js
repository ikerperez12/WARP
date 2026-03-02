import test from 'node:test';
import assert from 'node:assert/strict';
import { selectAutoQuality } from './performance.js';

test('selectAutoQuality picks low for heavy touch devices', () => {
  assert.equal(selectAutoQuality({ width: 1440, height: 3040, dpr: 3, touch: true, fps: 45 }), 'low');
});

test('selectAutoQuality picks high for smaller high-fps screens', () => {
  assert.equal(selectAutoQuality({ width: 1280, height: 720, dpr: 1, touch: false, fps: 90 }), 'high');
});
