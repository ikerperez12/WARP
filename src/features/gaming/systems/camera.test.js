import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { computeCameraFrame, computeCameraOffset, interpolateCameraConfig, resolveHeadingTarget, shortestAngleDelta } from './camera.js';

test('shortestAngleDelta follows the short arc across wrap-around', () => {
  const delta = shortestAngleDelta(Math.PI - 0.1, -Math.PI + 0.1);
  assert.ok(Math.abs(delta) < 0.25);
});

test('resolveHeadingTarget prefers explicit heading when provided', () => {
  const heading = resolveHeadingTarget({
    currentHeading: 0.5,
    explicitHeading: 1.25,
    previousTarget: { x: 0, z: 0 },
    nextTarget: { x: 4, z: 2 },
  });

  assert.equal(heading, 1.25);
});

test('resolveHeadingTarget infers heading from target motion', () => {
  const heading = resolveHeadingTarget({
    currentHeading: 0,
    previousTarget: { x: 0, z: 0 },
    nextTarget: { x: 0, z: 5 },
  });

  assert.equal(heading, 0);
});

test('computeCameraOffset increases distance with motion', () => {
  const config = {
    offset: { clone: () => ({ x: 4, y: 6, z: 10, applyAxisAngle: () => {} }) },
    lateralBias: 0.3,
    distanceScale: 0.2,
    heightScale: 0.05,
  };

  const calm = computeCameraOffset(config, 0, 0);
  const moving = computeCameraOffset(config, 1, 0);

  assert.ok(moving.z > calm.z);
  assert.ok(moving.y > calm.y);
});

test('computeCameraFrame widens fov and adds shoulder bias while moving', () => {
  const config = {
    fov: [43, 49],
    leadScale: 0.22,
    shoulderBias: 1.4,
  };

  const calm = computeCameraFrame(config, 0, 0);
  const moving = computeCameraFrame(config, 1, 0.5);

  assert.ok(moving.fov > calm.fov);
  assert.ok(moving.lookAhead > calm.lookAhead);
  assert.ok(moving.shoulderOffset > 0);
});

test('interpolateCameraConfig blends offsets and framing across mode transitions', () => {
  const from = {
    offset: new THREE.Vector3(4, 5, 8),
    lookYOffset: 2,
    damping: 0.08,
    headingDamping: 0.09,
    lateralBias: 0.2,
    distanceScale: 0.1,
    heightScale: 0.04,
    leadScale: 0.12,
    shoulderBias: 0.8,
    fov: [44, 48],
  };
  const to = {
    offset: new THREE.Vector3(8, 7, 14),
    lookYOffset: 2.5,
    damping: 0.11,
    headingDamping: 0.12,
    lateralBias: 0.4,
    distanceScale: 0.2,
    heightScale: 0.06,
    leadScale: 0.22,
    shoulderBias: 1.4,
    fov: [43, 49],
  };
  const blended = interpolateCameraConfig(from, to, 0.5);

  assert.ok(blended.offset.x > from.offset.x && blended.offset.x < to.offset.x);
  assert.ok(blended.lookYOffset > from.lookYOffset && blended.lookYOffset < to.lookYOffset);
  assert.ok(blended.fov[0] < from.fov[0] + 0.6);
  assert.ok(blended.fov[1] > from.fov[1]);
});
