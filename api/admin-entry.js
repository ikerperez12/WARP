import { canAccessAdminEntry, requireAdminSession, sendJson, setApiSecurityHeaders } from '../lib/admin.js';

export default async function handler(req, res) {
  setApiSecurityHeaders(res);
  if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });

  const session = requireAdminSession(req);
  if (session) return sendJson(res, 200, { ok: true, allowed: true, authenticated: true, redirectTo: '/admin.html' });

  if (canAccessAdminEntry(req)) {
    return sendJson(res, 200, { ok: true, allowed: true, authenticated: false, redirectTo: '/admin.html' });
  }

  return sendJson(res, 403, { ok: false, allowed: false, code: 'not_admin' });
}
