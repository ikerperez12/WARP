import test from 'node:test';
import assert from 'node:assert/strict';
import { computeAvatarFeedback } from './avatar.js';

test('computeAvatarFeedback stays calm at idle', () => {
  const feedback = computeAvatarFeedback({
    speed: 0,
    maxSpeed: 16.5,
    moveX: 0,
    velocityX: 0,
    velocityY: 0,
    stepTime: 0,
  });

  assert.equal(feedback.normalizedSpeed, 0);
  assert.equal(feedback.swing, 0);
  assert.ok(feedback.shadowOpacity >= 0.18);
});

test('computeAvatarFeedback increases motion cues with speed', () => {
  const slow = computeAvatarFeedback({
    speed: 2,
    maxSpeed: 16.5,
    moveX: 0.2,
    velocityX: 1,
    velocityY: 2,
    stepTime: 1.2,
  });
  const fast = computeAvatarFeedback({
    speed: 12,
    maxSpeed: 16.5,
    moveX: 1,
    velocityX: 4,
    velocityY: 9,
    stepTime: 1.2,
  });

  assert.ok(fast.normalizedSpeed > slow.normalizedSpeed);
  assert.ok(fast.shadowScale > slow.shadowScale);
  assert.ok(fast.haloOpacity > slow.haloOpacity);
  assert.notEqual(fast.leanZ, slow.leanZ);
});

test('computeAvatarFeedback intensifies halo and motion during dash', () => {
  const normal = computeAvatarFeedback({
    speed: 8,
    maxSpeed: 16.5,
    moveX: 1,
    velocityX: 2,
    velocityY: 6,
    stepTime: 1.4,
    dashing: false,
  });
  const dashing = computeAvatarFeedback({
    speed: 8,
    maxSpeed: 16.5,
    moveX: 1,
    velocityX: 2,
    velocityY: 6,
    stepTime: 1.4,
    dashing: true,
  });

  assert.ok(dashing.haloOpacity > normal.haloOpacity);
  assert.ok(dashing.haloScale > normal.haloScale);
  assert.ok(dashing.dashGlow > normal.dashGlow);
});
