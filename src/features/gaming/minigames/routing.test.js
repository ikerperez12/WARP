import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoutingState, handleRoutingInteract } from './routing.js';

test('routing minigame increases overflow on wrong switch values', () => {
  const state = createRoutingState();
  state.towers = new Set(['routing-tower-a', 'routing-tower-b', 'routing-tower-c']);
  const result = handleRoutingInteract(state, { id: 'routing-switch-a', type: 'routing-switch' }, 'foot');
  assert.equal(result.changed, true);
  assert.equal(result.warning, true);
  assert.equal(state.overflow > 0, true);
});

test('routing minigame fails when overflow reaches 100', () => {
  const state = createRoutingState();
  state.towers = new Set(['routing-tower-a', 'routing-tower-b', 'routing-tower-c']);
  state.overflow = 95;
  const result = handleRoutingInteract(state, { id: 'routing-switch-a', type: 'routing-switch' }, 'foot');
  assert.equal(result.fail, true);
});
