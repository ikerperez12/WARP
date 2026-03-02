import test from 'node:test';
import assert from 'node:assert/strict';
import { createInferenceState, handleInferenceInteract } from './inference.js';

test('inference minigame raises overload on wrong terminal input', () => {
  const state = createInferenceState();
  state.seeds = new Set(['a', 'b', 'c', 'd']);
  const result = handleInferenceInteract(state, { id: 'inference-terminal-beta', type: 'inference-terminal', key: 'beta' }, 'foot');
  assert.equal(result.warning, true);
  assert.equal(state.overload, 30);
});

test('inference minigame fails when overload reaches 100', () => {
  const state = createInferenceState();
  state.seeds = new Set(['a', 'b', 'c', 'd']);
  state.overload = 80;
  const result = handleInferenceInteract(state, { id: 'inference-terminal-gamma', type: 'inference-terminal', key: 'gamma' }, 'foot');
  assert.equal(result.fail, true);
});
