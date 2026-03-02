import test from 'node:test';
import assert from 'node:assert/strict';
import { createSecurityState, getSecurityProgress, handleSecurityInteract } from './security.js';

test('security minigame completes only after full ordered sequence', () => {
  const state = createSecurityState();

  handleSecurityInteract(state, { id: 'security-beacon-a', type: 'security-beacon' }, 'vehicle');
  handleSecurityInteract(state, { id: 'security-beacon-b', type: 'security-beacon' }, 'vehicle');
  handleSecurityInteract(state, { id: 'security-shard-a', type: 'security-shard' }, 'foot');
  handleSecurityInteract(state, { id: 'security-shard-b', type: 'security-shard' }, 'foot');
  handleSecurityInteract(state, { id: 'security-shard-c', type: 'security-shard' }, 'foot');
  handleSecurityInteract(state, { id: 'security-node-a', type: 'security-node' }, 'foot');
  handleSecurityInteract(state, { id: 'security-node-b', type: 'security-node' }, 'foot');
  const result = handleSecurityInteract(state, { id: 'security-node-c', type: 'security-node' }, 'foot');

  assert.equal(result.completed, true);
  assert.equal(state.completed, true);
  assert.deepEqual(getSecurityProgress(state), {
    outer: 2,
    outerTotal: 2,
    shards: 3,
    nodes: 3,
    alarm: 0,
    completed: true,
  });
});

test('security minigame resets node chain and increases alarm on wrong node', () => {
  const state = createSecurityState();
  state.beacons = new Set(['security-beacon-a', 'security-beacon-b']);
  state.shards = new Set(['security-shard-a', 'security-shard-b', 'security-shard-c']);
  state.nodes = ['security-node-a'];

  const result = handleSecurityInteract(state, { id: 'security-node-c', type: 'security-node' }, 'foot');

  assert.equal(result.warning, true);
  assert.equal(result.scoreDelta, -90);
  assert.deepEqual(state.nodes, []);
  assert.equal(state.alarm, 24);
});
