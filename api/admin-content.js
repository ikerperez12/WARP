import {
  assertSameOrigin,
  readJsonBody,
  readSiteData,
  requireAdminSession,
  sendJson,
  setApiSecurityHeaders,
  writeSiteData,
} from '../lib/admin.js';

export default async function handler(req, res) {
  setApiSecurityHeaders(res);
  const session = requireAdminSession(req);
  if (!session) return sendJson(res, 401, { ok: false, error: 'Authentication required.' });

  if (req.method === 'GET') {
    try {
      const data = await readSiteData('content');
      return sendJson(res, 200, { ok: true, data });
    } catch (error) {
      return sendJson(res, 500, { ok: false, error: error.message || 'Failed to load content.' });
    }
  }

  if (req.method === 'PUT') {
    if (!assertSameOrigin(req)) return sendJson(res, 403, { ok: false, error: 'Invalid origin.' });
    const body = readJsonBody(req);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return sendJson(res, 400, { ok: false, error: 'Content payload must be a JSON object.' });
    }

    try {
      await writeSiteData('content', body);
      return sendJson(res, 200, { ok: true });
    } catch (error) {
      return sendJson(res, 500, { ok: false, error: error.message || 'Failed to save content.' });
    }
  }

  return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
}

