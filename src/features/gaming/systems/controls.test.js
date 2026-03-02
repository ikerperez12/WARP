import test from 'node:test';
import assert from 'node:assert/strict';
import { createKeyboardSnapshot } from './controls.js';

test('createKeyboardSnapshot computes axes and edge actions', () => {
  const pressed = new Set(['KeyW', 'KeyD', 'ShiftLeft']);
  const snapshot = createKeyboardSnapshot(pressed, { interact: true, pause: false });
  assert.equal(snapshot.moveX, 1);
  assert.equal(snapshot.moveY, 1);
  assert.equal(snapshot.boost, true);
  assert.equal(snapshot.interact, true);
});
