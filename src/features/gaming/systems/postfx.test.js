import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePostFXProfile } from './postfx.js';

test('resolvePostFXProfile disables composer for low bloom presets', () => {
  const profile = resolvePostFXProfile('dark', { bloom: 0.2 });
  assert.equal(profile.enableComposer, false);
  assert.ok(profile.toneMappingExposure > 1);
  assert.ok(profile.vignetteStrength > 0);
  assert.ok(profile.scanlineStrength > 0);
});

test('resolvePostFXProfile enables composer and varies bloom by theme', () => {
  const dark = resolvePostFXProfile('dark', { bloom: 0.8 });
  const light = resolvePostFXProfile('light', { bloom: 0.8 });
  assert.equal(dark.enableComposer, true);
  assert.equal(light.enableComposer, true);
  assert.ok(dark.bloomStrength > light.bloomStrength);
  assert.ok(dark.bloomRadius > light.bloomRadius);
  assert.ok(dark.vignetteStrength > light.vignetteStrength);
  assert.ok(dark.scanlineStrength > light.scanlineStrength);
});
