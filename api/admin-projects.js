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
      const data = await readSiteData('projects');
      return sendJson(res, 200, { ok: true, data });
    } catch (error) {
      return sendJson(res, 500, { ok: false, error: error.message || 'Failed to load projects.' });
    }
  }

  if (req.method === 'PUT') {
    if (!assertSameOrigin(req)) return sendJson(res, 403, { ok: false, error: 'Invalid origin.' });
    const body = readJsonBody(req);
    if (!Array.isArray(body)) {
      return sendJson(res, 400, { ok: false, error: 'Projects payload must be a JSON array.' });
    }

    try {
      await writeSiteData('projects', body);
      return sendJson(res, 200, { ok: true });
    } catch (error) {
      return sendJson(res, 500, { ok: false, error: error.message || 'Failed to save projects.' });
    }
  }

  return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
}

