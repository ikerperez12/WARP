import {
  assertSameOrigin,
  createSessionToken,
  readJsonBody,
  sendJson,
  setApiSecurityHeaders,
  setSessionCookie,
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

  const body = readJsonBody(req);
  const username = body.username;
  const password = body.password;

  if (!validateAdminCredentials(username, password)) {
    return sendJson(res, 401, { ok: false, error: 'Invalid credentials.' });
  }

  try {
    const token = createSessionToken(username);
    setSessionCookie(res, token);
    return sendJson(res, 200, { ok: true, username });
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: error.message || 'Admin session setup failed.' });
  }
}

