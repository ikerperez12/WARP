import { sendJson, setApiSecurityHeaders } from '../lib/admin.js';
import { authenticationOptions, authenticationVerify, registrationOptions, registrationVerify } from './admin-passkeys.js';

export default function handler(req, res) {
  setApiSecurityHeaders(res);

  const mode = req.query?.mode;
  if (mode === 'register-options') return registrationOptions(req, res);
  if (mode === 'register-verify') return registrationVerify(req, res);
  if (mode === 'auth-options') return authenticationOptions(req, res);
  if (mode === 'auth-verify') return authenticationVerify(req, res);

  return sendJson(res, 404, { ok: false, error: 'Unknown passkey action.' });
}
