import { readSiteData, sendJson, setApiSecurityHeaders } from '../lib/admin.js';

export default async function handler(req, res) {
  setApiSecurityHeaders(res);
  if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });

  try {
    const data = await readSiteData('content');
    return sendJson(res, 200, { ok: true, data });
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: error.message || 'Failed to load public content.' });
  }
}

