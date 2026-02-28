import { clearSessionCookie, sendJson, setApiSecurityHeaders } from '../lib/admin.js';

export default async function handler(req, res) {
  setApiSecurityHeaders(res);
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  clearSessionCookie(res);
  return sendJson(res, 200, { ok: true });
}

