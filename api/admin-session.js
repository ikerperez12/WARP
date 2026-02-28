import { requireAdminSession, sendJson, setApiSecurityHeaders } from '../lib/admin.js';

export default async function handler(req, res) {
  setApiSecurityHeaders(res);
  const session = requireAdminSession(req);
  if (!session) return sendJson(res, 401, { ok: false, authenticated: false });
  return sendJson(res, 200, { ok: true, authenticated: true, username: session.u });
}

