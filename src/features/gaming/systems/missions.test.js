import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../state.js';
import { completeMission, getNextMissionId, isSectorUnlocked } from './missions.js';

test('missions unlock in strict sequence', () => {
  let state = createInitialState();
  state = completeMission(state, 'boot-sequence');
  assert.equal(state.currentMission, 'breach-firewall');
  assert.equal(isSectorUnlocked(state, 'firewall-sector'), true);

  state = completeMission(state, 'breach-firewall');
  assert.equal(state.currentMission, 'restore-routing');
  assert.equal(isSectorUnlocked(state, 'routing-array'), true);
});

test('getNextMissionId returns null for final mission', () => {
  assert.equal(getNextMissionId('system-reboot'), null);
});
