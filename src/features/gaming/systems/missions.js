import { MISSION_ORDER, SECTOR_UNLOCKS } from '../config.js';

export const missionDefinitions = {
  'boot-sequence': { sectorId: 'boot-relay' },
  'breach-firewall': { sectorId: 'firewall-sector' },
  'restore-routing': { sectorId: 'routing-array' },
  'stabilize-inference': { sectorId: 'inference-core' },
  'system-reboot': { sectorId: 'core-chamber' },
};

export function getNextMissionId(missionId) {
  const index = MISSION_ORDER.indexOf(missionId);
  return index >= 0 ? MISSION_ORDER[index + 1] || null : null;
}

export function completeMission(state, missionId) {
  if (state.completedMissions.includes(missionId)) return state;

  const completedMissions = [...state.completedMissions, missionId];
  const nextMission = getNextMissionId(missionId);
  const unlocked = new Set(state.unlockedSectors);

  for (const sectorId of SECTOR_UNLOCKS[missionId] || []) unlocked.add(sectorId);

  return {
    ...state,
    completedMissions,
    currentMission: nextMission || missionId,
    unlockedSectors: [...unlocked],
  };
}

export function isSectorUnlocked(state, sectorId) {
  return state.unlockedSectors.includes(sectorId);
}
