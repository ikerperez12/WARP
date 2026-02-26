import { test, describe } from 'node:test';
import assert from 'node:assert';
import handler from '../../api/contact.js';

describe('API Security Headers', () => {
  test('should set security headers on response', async () => {
    const req = {
      method: 'GET', // Use GET to trigger early return
      headers: {},
      body: {}
    };

    const headers = {};
    let statusCode = 0;
    let body = '';

    const res = {
      setHeader: (name, value) => {
        headers[name.toLowerCase()] = value;
      },
      status: (code) => {
        statusCode = code;
        return res;
      },
      send: (data) => {
        body = data;
        return res;
      }
    };

    await handler(req, res);

    // Verify existing header
    assert.strictEqual(headers['x-content-type-options'], 'nosniff', 'X-Content-Type-Options should be nosniff');

    // Verify missing headers (expecting these assertions to fail initially)
    assert.strictEqual(headers['strict-transport-security'], 'max-age=63072000; includeSubDomains; preload', 'HSTS header missing or incorrect');
    assert.strictEqual(headers['x-frame-options'], 'DENY', 'X-Frame-Options header missing or incorrect');
    assert.strictEqual(headers['content-security-policy'], "default-src 'none'; frame-ancestors 'none'; sandbox", 'CSP header missing or incorrect');
    assert.strictEqual(headers['referrer-policy'], 'strict-origin-when-cross-origin', 'Referrer-Policy header missing or incorrect');
    assert.strictEqual(headers['permissions-policy'], 'geolocation=(), microphone=(), camera=(), payment=()', 'Permissions-Policy header missing or incorrect');
  });
});
