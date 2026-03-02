import test from 'node:test';
import assert from 'node:assert/strict';
import { canToggleModeAtDock, syncEntityPositions } from './transition.js';

function createEntity(x, z) {
  return {
    position: { x, z },
    getPosition() {
      return { ...this.position };
    },
    setPosition(nextX, _y, nextZ) {
      this.position = { x: nextX, z: nextZ };
    },
  };
}

test('canToggleModeAtDock allows mode switch only on dock interactables', () => {
  assert.equal(canToggleModeAtDock('vehicle', { type: 'dock' }), true);
  assert.equal(canToggleModeAtDock('foot', { type: 'security-node' }), false);
  assert.equal(canToggleModeAtDock('vehicle', null), false);
});

test('syncEntityPositions copies active entity coordinates to the inactive one', () => {
  const vehicle = createEntity(12, -4);
  const avatar = createEntity(0, 0);
  syncEntityPositions('vehicle', vehicle, avatar);
  assert.deepEqual(avatar.getPosition(), { x: 12, z: -4 });

  avatar.setPosition(-8, 0, 16);
  syncEntityPositions('foot', vehicle, avatar);
  assert.deepEqual(vehicle.getPosition(), { x: -8, z: 16 });
});
