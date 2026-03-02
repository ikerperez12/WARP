import test from 'node:test';
import assert from 'node:assert/strict';
import { findNearestInteractable, findSectorForPoint, pointInCircle } from './zones.js';

test('pointInCircle detects inside points', () => {
  assert.equal(pointInCircle({ x: 0, z: 0 }, { center: { x: 0, z: 0 }, radius: 10 }), true);
  assert.equal(pointInCircle({ x: 14, z: 0 }, { center: { x: 0, z: 0 }, radius: 10 }), false);
});

test('findSectorForPoint falls back to first sector and detects routing array', () => {
  assert.equal(findSectorForPoint({ x: 84, z: -2 }).id, 'routing-array');
  assert.equal(findSectorForPoint({ x: 500, z: 500 }).id, 'boot-relay');
});

test('findNearestInteractable returns nearest active item within radius', () => {
  const result = findNearestInteractable(
    { x: 0, z: 0 },
    [
      { id: 'a', active: true, position: { x: 5, z: 0 } },
      { id: 'b', active: true, position: { x: 3, z: 0 } },
    ],
    6,
  );
  assert.equal(result.item.id, 'b');
});
