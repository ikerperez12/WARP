import { test } from 'node:test';
import assert from 'node:assert';
import { __testing } from '../../lib/admin.js';

const originalEnv = {
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
};

test('admin credentials validate against configured username and password', () => {
  process.env.ADMIN_USERNAME = 'iker';
  process.env.ADMIN_PASSWORD = 'super-secret';
  process.env.ADMIN_PASSWORD_HASH = '';

  assert.equal(__testing.validateAdminCredentials('iker', 'super-secret'), true);
  assert.equal(__testing.validateAdminCredentials('iker', 'wrong'), false);
});

test('session tokens are signed and verified', () => {
  process.env.ADMIN_SESSION_SECRET = '0123456789abcdef0123456789abcdef';
  const token = __testing.createSessionToken('iker');
  const payload = __testing.verifySessionToken(token);

  assert.equal(payload.u, 'iker');
  assert.ok(payload.exp > Date.now());
  assert.equal(__testing.verifySessionToken(`${token}tampered`), null);
});

test('same-origin guard accepts matching host and origin', () => {
  assert.equal(__testing.assertSameOrigin({ headers: { origin: 'https://example.com', host: 'example.com' } }), true);
  assert.equal(__testing.assertSameOrigin({ headers: { origin: 'https://evil.com', host: 'example.com' } }), false);
});

process.on('exit', () => {
  Object.entries(originalEnv).forEach(([key, value]) => {
    if (typeof value === 'undefined') delete process.env[key];
    else process.env[key] = value;
  });
});
