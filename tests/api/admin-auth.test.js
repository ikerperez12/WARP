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
  assert.equal(__testing.assertSameOrigin({ headers: { host: 'example.com' } }), false);
});

test('admin network allowlist accepts configured prefixes', () => {
  process.env.ADMIN_ALLOWED_IPS = '';
  process.env.ADMIN_ALLOWED_IP_PREFIXES = '79.146.,192.168.';
  assert.equal(__testing.isAllowedAdminNetwork({ headers: { 'x-forwarded-for': '79.146.22.10, 10.0.0.1' } }), true);
  assert.equal(__testing.isAllowedAdminNetwork({ headers: { 'x-forwarded-for': '8.8.8.8' } }), false);
});

test('trusted device tokens are signed and verified', () => {
  process.env.ADMIN_SESSION_SECRET = '0123456789abcdef0123456789abcdef';
  const token = __testing.createTrustedDeviceToken('iker');
  const payload = __testing.verifyTrustedDeviceToken(token);

  assert.equal(payload.u, 'iker');
  assert.equal(payload.kind, 'device');
  assert.equal(__testing.verifyTrustedDeviceToken(`${token}broken`), null);
});

process.on('exit', () => {
  Object.entries(originalEnv).forEach(([key, value]) => {
    if (typeof value === 'undefined') delete process.env[key];
    else process.env[key] = value;
  });
});
