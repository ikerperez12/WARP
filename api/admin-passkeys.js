import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import {
  assertSameOrigin,
  canAccessAdminEntry,
  clearAdminChallenge,
  createSessionToken,
  createTrustedDeviceToken,
  getExpectedOrigins,
  getExpectedRPID,
  getStoredPasskeys,
  hydrateStoredPasskey,
  normalizeStoredPasskey,
  readAdminChallenge,
  readJsonBody,
  requireAdminSession,
  saveStoredPasskeys,
  sendJson,
  setApiSecurityHeaders,
  setSessionCookies,
  storeAdminChallenge,
} from '../lib/admin.js';

const RP_NAME = 'WARP Portfolio Admin';
const PASSKEY_USER = 'iker-admin';
const PASSKEY_DISPLAY_NAME = 'Iker Perez Garcia';

export async function registrationOptions(req, res) {
  setApiSecurityHeaders(res);
  if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
  if (!assertSameOrigin(req)) return sendJson(res, 403, { ok: false, error: 'Invalid origin.' });
  if (!requireAdminSession(req)) return sendJson(res, 401, { ok: false, error: 'Authentication required.' });

  try {
    const existing = await getStoredPasskeys();
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: getExpectedRPID(req),
      userName: PASSKEY_USER,
      userDisplayName: PASSKEY_DISPLAY_NAME,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
        authenticatorAttachment: 'platform',
      },
      excludeCredentials: existing.map((passkey) => ({
        id: passkey.id,
        transports: passkey.transports || ['internal'],
      })),
      preferredAuthenticatorType: 'localDevice',
    });

    await storeAdminChallenge(req, 'register', options.challenge);
    return sendJson(res, 200, { ok: true, options });
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: error.message || 'Failed to create passkey registration options.' });
  }
}

export async function registrationVerify(req, res) {
  setApiSecurityHeaders(res);
  if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
  if (!assertSameOrigin(req)) return sendJson(res, 403, { ok: false, error: 'Invalid origin.' });
  if (!requireAdminSession(req)) return sendJson(res, 401, { ok: false, error: 'Authentication required.' });

  try {
    const body = readJsonBody(req);
    if (!body) return sendJson(res, 400, { ok: false, error: 'Malformed JSON body.' });

    const expectedChallenge = await readAdminChallenge(req, 'register');
    if (!expectedChallenge) return sendJson(res, 400, { ok: false, error: 'Registration challenge expired.' });

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: getExpectedOrigins(req),
      expectedRPID: getExpectedRPID(req),
      requireUserVerification: true,
    });

    await clearAdminChallenge(req, 'register');

    if (!verification.verified || !verification.registrationInfo) {
      return sendJson(res, 400, { ok: false, error: 'Passkey registration could not be verified.' });
    }

    const existing = await getStoredPasskeys();
    const next = existing.filter((item) => item.id !== verification.registrationInfo.credential.id);
    next.push(
      normalizeStoredPasskey({
        id: verification.registrationInfo.credential.id,
        publicKey: verification.registrationInfo.credential.publicKey,
        counter: verification.registrationInfo.credential.counter,
        transports: body.response?.transports || ['internal'],
        deviceType: verification.registrationInfo.credentialDeviceType,
        backedUp: verification.registrationInfo.credentialBackedUp,
      })
    );
    await saveStoredPasskeys(next);

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: error.message || 'Passkey registration failed.' });
  }
}

export async function authenticationOptions(req, res) {
  setApiSecurityHeaders(res);
  if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
  if (!assertSameOrigin(req)) return sendJson(res, 403, { ok: false, error: 'Invalid origin.' });
  if (!canAccessAdminEntry(req)) return sendJson(res, 403, { ok: false, error: 'No admin access from this context.' });

  try {
    const passkeys = await getStoredPasskeys();
    if (!passkeys.length) return sendJson(res, 400, { ok: false, error: 'No registered passkeys.' });

    const options = await generateAuthenticationOptions({
      rpID: getExpectedRPID(req),
      allowCredentials: passkeys.map((passkey) => ({
        id: passkey.id,
        transports: passkey.transports || ['internal'],
      })),
      userVerification: 'required',
    });

    await storeAdminChallenge(req, 'auth', options.challenge);
    return sendJson(res, 200, { ok: true, options });
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: error.message || 'Failed to create passkey authentication options.' });
  }
}

export async function authenticationVerify(req, res) {
  setApiSecurityHeaders(res);
  if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
  if (!assertSameOrigin(req)) return sendJson(res, 403, { ok: false, error: 'Invalid origin.' });

  try {
    const body = readJsonBody(req);
    if (!body) return sendJson(res, 400, { ok: false, error: 'Malformed JSON body.' });

    const expectedChallenge = await readAdminChallenge(req, 'auth');
    if (!expectedChallenge) return sendJson(res, 400, { ok: false, error: 'Authentication challenge expired.' });

    const passkeys = await getStoredPasskeys();
    const stored = passkeys.find((item) => item.id === body.id || item.id === body.rawId);
    if (!stored) return sendJson(res, 404, { ok: false, error: 'Passkey not recognized.' });

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: getExpectedOrigins(req),
      expectedRPID: getExpectedRPID(req),
      credential: hydrateStoredPasskey(stored),
      requireUserVerification: true,
    });

    await clearAdminChallenge(req, 'auth');

    if (!verification.verified) return sendJson(res, 401, { ok: false, error: 'Passkey authentication failed.' });

    const updated = passkeys.map((item) =>
      item.id === stored.id ? { ...item, counter: verification.authenticationInfo.newCounter } : item
    );
    await saveStoredPasskeys(updated);

    const sessionToken = createSessionToken(PASSKEY_USER);
    const trustedDeviceToken = createTrustedDeviceToken(PASSKEY_USER);
    setSessionCookies(res, sessionToken, trustedDeviceToken);
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: error.message || 'Passkey authentication failed.' });
  }
}
