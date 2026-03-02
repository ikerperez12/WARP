import test from 'node:test';
import assert from 'node:assert/strict';
import { computeJoystickVector } from './touch-controls.js';

test('computeJoystickVector normalizes pointer movement', () => {
  const vector = computeJoystickVector({ x: 100, y: 100 }, { x: 148, y: 52 }, 48);
  assert.equal(Math.round(vector.moveX * 100), 71);
  assert.equal(Math.round(vector.moveY * 100), 71);
});
