import {
  assertSameOrigin,
  canAccessAdminEntry,
  createSessionToken,
  createTrustedDeviceToken,
  readJsonBody,
  sendJson,
  setApiSecurityHeaders,
  setSessionCookies,
  validateAdminCredentials,
} from '../lib/admin.js';

export default async function handler(req, res) {
  setApiSecurityHeaders(res);

  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  if (!assertSameOrigin(req)) {
    return sendJson(res, 403, { ok: false, error: 'Invalid origin.' });
  }

  if (!canAccessAdminEntry(req)) {
    return sendJson(res, 403, { ok: false, error: 'This admin login is only available from an allowed network or a trusted browser.' });
  }

  const body = readJsonBody(req);
  if (!body) {
    return sendJson(res, 400, { ok: false, error: 'Malformed JSON body.' });
  }
  const username = body.username;
  const password = body.password;

  if (!validateAdminCredentials(username, password)) {
    return sendJson(res, 401, { ok: false, error: 'Invalid credentials.' });
  }

  try {
    const token = createSessionToken(username);
    const trustedDeviceToken = createTrustedDeviceToken(username);
    setSessionCookies(res, token, trustedDeviceToken);
    return sendJson(res, 200, { ok: true, username });
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: error.message || 'Admin session setup failed.' });
  }
}
