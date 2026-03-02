import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, hydrateGameState, initialGameState } from './state.js';

test('createInitialState preserves defaults and score buckets', () => {
  const state = createInitialState();
  assert.equal(state.currentMission, initialGameState.currentMission);
  assert.deepEqual(state.bestScores, { security: 0, routing: 0, inference: 0 });
  assert.deepEqual(state.unlockedSectors, ['boot-relay']);
});

test('hydrateGameState merges save payload with live prefs', () => {
  const state = hydrateGameState({
    currentMission: 'restore-routing',
    completedMissions: ['boot-sequence', 'breach-firewall'],
    unlockedSectors: ['boot-relay', 'firewall-sector', 'routing-array'],
    bestScores: { security: 900, routing: 1200, inference: 0 },
    settings: { quality: 'medium' },
  }, {
    theme: 'light',
    lang: 'en',
  });

  assert.equal(state.currentMission, 'restore-routing');
  assert.deepEqual(state.completedMissions, ['boot-sequence', 'breach-firewall']);
  assert.deepEqual(state.bestScores, { security: 900, routing: 1200, inference: 0 });
  assert.deepEqual(state.settings, {
    quality: 'medium',
    theme: 'light',
    lang: 'en',
  });
});
