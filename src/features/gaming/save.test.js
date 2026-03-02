import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSavePayload, loadSave, normalizeSave, persistSave, resetSave } from './save.js';

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, value); },
    removeItem(key) { store.delete(key); },
  };
}

test('normalizeSave rejects unknown versions', () => {
  assert.equal(normalizeSave({ version: 999 }), null);
});

test('persistSave and loadSave roundtrip', () => {
  const storage = createMemoryStorage();
  const state = {
    completedMissions: ['breach-firewall'],
    unlockedSectors: ['boot-relay', 'firewall-sector', 'routing-array'],
    currentMission: 'restore-routing',
    bestScores: { security: 1200, routing: 0, inference: 0 },
    settings: { quality: 'medium' },
  };

  persistSave(state, storage);
  assert.deepEqual(loadSave(storage), buildSavePayload(state));
});

test('resetSave removes saved payload', () => {
  const storage = createMemoryStorage();
  storage.setItem('warp.gameProgress.v1', '{"version":1}');
  assert.equal(resetSave(storage), true);
  assert.equal(storage.getItem('warp.gameProgress.v1'), null);
});
