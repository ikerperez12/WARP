import { beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { __testing } from '../../api/contact.js';

const { rateStore, RATE_MAX_REQUESTS, RATE_WINDOW_MS, allowRateLimitInMemory, allowRateLimit } = __testing;

beforeEach(() => {
  rateStore.clear();
  rateStore.lastCleanup = 0;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
});

describe('contact rate limiter', () => {
  test('allows requests up to the configured max and then blocks', () => {
    const now = 1_000_000;
    const key = '127.0.0.1:test@example.com';

    for (let i = 0; i < RATE_MAX_REQUESTS; i += 1) {
      assert.equal(allowRateLimitInMemory(key, now), true);
    }

    assert.equal(allowRateLimitInMemory(key, now), false);
  });

  test('resets the counter after the rate window expires', () => {
    const now = 2_000_000;
    const key = '127.0.0.2:test@example.com';

    for (let i = 0; i < RATE_MAX_REQUESTS; i += 1) {
      assert.equal(allowRateLimitInMemory(key, now), true);
    }

    assert.equal(allowRateLimitInMemory(key, now), false);
    assert.equal(allowRateLimitInMemory(key, now + RATE_WINDOW_MS + 1), true);
  });

  test('falls back to in-memory rate limiting when KV is not configured', async () => {
    const now = 3_000_000;
    const key = '127.0.0.3:test@example.com';

    for (let i = 0; i < RATE_MAX_REQUESTS; i += 1) {
      assert.equal(await allowRateLimit(key, now), true);
    }

    assert.equal(await allowRateLimit(key, now), false);
  });
});
