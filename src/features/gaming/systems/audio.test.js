import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampAudioUnit,
  computeAmbientMix,
  computeEngineMix,
  pickAudioVariant,
  resolveAmbientProfile,
} from './audio.js';

test('computeEngineMix mutes engine outside active vehicle gameplay', () => {
  const mix = computeEngineMix({ speed: 20, mode: 'foot', started: true, paused: false, hidden: false });
  assert.equal(mix.active, false);
  assert.equal(mix.targetVolume, 0);
  assert.ok(mix.targetRate > 0.7);
});

test('computeEngineMix scales volume and playback rate with vehicle speed', () => {
  const idle = computeEngineMix({ speed: 0, mode: 'vehicle', started: true, paused: false, hidden: false });
  const fast = computeEngineMix({ speed: 34, mode: 'vehicle', started: true, paused: false, hidden: false });
  assert.equal(idle.active, true);
  assert.equal(idle.normalizedSpeed, 0);
  assert.equal(fast.normalizedSpeed, 1);
  assert.ok(fast.targetVolume > idle.targetVolume);
  assert.ok(fast.targetRate > idle.targetRate);
});

test('pickAudioVariant clamps random selection to an existing sample', () => {
  const variants = ['a', 'b', 'c'];
  assert.equal(pickAudioVariant(variants, () => -1), 'a');
  assert.equal(pickAudioVariant(variants, () => 0.51), 'b');
  assert.equal(pickAudioVariant(variants, () => 1.7), 'c');
  assert.equal(clampAudioUnit(5), 1);
});

test('resolveAmbientProfile returns a stable fallback for unknown sectors', () => {
  const known = resolveAmbientProfile('routing-array');
  const fallback = resolveAmbientProfile('unknown-sector');
  assert.equal(known.id, 'routing-array');
  assert.equal(fallback.id, 'boot-relay');
});

test('computeAmbientMix mutes ambience when gameplay is paused or hidden', () => {
  const paused = computeAmbientMix({
    sector: 'firewall-sector',
    mode: 'vehicle',
    started: true,
    paused: true,
    hidden: false,
  });
  const hidden = computeAmbientMix({
    sector: 'firewall-sector',
    mode: 'vehicle',
    started: true,
    paused: false,
    hidden: true,
  });

  assert.equal(paused.targetVolume, 0);
  assert.equal(hidden.targetVolume, 0);
  assert.equal(paused.active, false);
  assert.equal(hidden.active, false);
});

test('computeAmbientMix adapts rate and volume to sector and mode', () => {
  const vehicleMix = computeAmbientMix({
    sector: 'inference-core',
    mode: 'vehicle',
    started: true,
    paused: false,
    hidden: false,
  });
  const footMix = computeAmbientMix({
    sector: 'inference-core',
    mode: 'foot',
    started: true,
    paused: false,
    hidden: false,
  });

  assert.equal(vehicleMix.sector, 'inference-core');
  assert.equal(footMix.sector, 'inference-core');
  assert.ok(footMix.targetVolume > vehicleMix.targetVolume);
  assert.ok(footMix.targetRate < vehicleMix.targetRate);
});
