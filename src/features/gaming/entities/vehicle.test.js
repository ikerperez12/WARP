import test from 'node:test';
import assert from 'node:assert/strict';
import { computeVehicleFeedback, hasImportedVehicleCore } from './vehicle.js';

test('hasImportedVehicleCore requires chassis and wheel assets', () => {
  assert.equal(hasImportedVehicleCore(null), false);
  assert.equal(hasImportedVehicleCore({ cybertruckChassis: {} }), false);
  assert.equal(hasImportedVehicleCore({ cybertruckWheel: {} }), false);
  assert.equal(hasImportedVehicleCore({ cybertruckChassis: {}, cybertruckWheel: {} }), true);
});

test('computeVehicleFeedback raises brake strength while decelerating', () => {
  const feedback = computeVehicleFeedback({
    speed: 10,
    previousSpeed: 16,
    maxSpeed: 34,
    velocityX: 3,
    velocityY: -8,
    inputX: 0,
    bodyFloat: 2.4,
    moving: false,
  });

  assert.ok(feedback.brakeStrength > 0.7);
  assert.ok(feedback.normalizedSpeed > 0.2);
});

test('computeVehicleFeedback steers and leans with lateral input', () => {
  const left = computeVehicleFeedback({
    speed: 18,
    previousSpeed: 18,
    maxSpeed: 34,
    velocityX: -5,
    velocityY: 9,
    inputX: -1,
    bodyFloat: 1.2,
    moving: true,
  });
  const right = computeVehicleFeedback({
    speed: 18,
    previousSpeed: 18,
    maxSpeed: 34,
    velocityX: 5,
    velocityY: 9,
    inputX: 1,
    bodyFloat: 1.2,
    moving: true,
  });

  assert.ok(left.steerAngle < 0);
  assert.ok(right.steerAngle > 0);
  assert.ok(left.antennaRoll < 0);
  assert.ok(right.antennaRoll > 0);
});

test('computeVehicleFeedback adds extra visual response on boost', () => {
  const calm = computeVehicleFeedback({
    speed: 18,
    previousSpeed: 18,
    maxSpeed: 34,
    velocityX: 2,
    velocityY: 8,
    inputX: 0.4,
    bodyFloat: 1.6,
    moving: true,
    boost: false,
  });
  const boosted = computeVehicleFeedback({
    speed: 18,
    previousSpeed: 18,
    maxSpeed: 34,
    velocityX: 2,
    velocityY: 8,
    inputX: 0.4,
    bodyFloat: 1.6,
    moving: true,
    boost: true,
  });

  assert.ok(boosted.boostGlow > calm.boostGlow);
  assert.ok(boosted.shadowScale > calm.shadowScale);
  assert.ok(boosted.pitch < calm.pitch);
});
