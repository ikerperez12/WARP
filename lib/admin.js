import { kv } from '@vercel/kv';
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

const SESSION_COOKIE = 'warp_admin_session';
const TRUSTED_DEVICE_COOKIE = 'warp_admin_device';
const SESSION_MAX_AGE = 60 * 60 * 8;
const TRUSTED_DEVICE_MAX_AGE = 60 * 60 * 24 * 45;
const CONTENT_KEY = 'warp:site:content';
const PROJECTS_KEY = 'warp:site:projects';
const PASSKEYS_KEY = 'warp:admin:passkeys';
const CHALLENGE_PREFIX = 'warp:admin:challenge:';
const localChallengeStore = globalThis.__warpAdminChallengeStore || new Map();
const localPasskeyStore = globalThis.__warpAdminPasskeyStore || [];
globalThis.__warpAdminChallengeStore = localChallengeStore;
globalThis.__warpAdminPasskeyStore = localPasskeyStore;

function toText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

function getExpectedPasswordHash() {
  const directHash = toText(process.env.ADMIN_PASSWORD_HASH);
  if (directHash) return directHash.toLowerCase();
  const password = toText(process.env.ADMIN_PASSWORD);
  return password ? hashPassword(password) : '';
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function signPayload(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function getSessionSecret() {
  return toText(process.env.ADMIN_SESSION_SECRET);
}

function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return raw.split(';').reduce((acc, part) => {
    const [key, ...rest] = part.split('=');
    if (!key) return acc;
    acc[key.trim()] = rest.join('=').trim();
    return acc;
  }, {});
}

function parseCsvEnv(name) {
  return toText(process.env[name]).split(',').map((item) => item.trim()).filter(Boolean);
}

export function getClientIp(req) {
  const remote = toText(req.socket?.remoteAddress || '');
  const vercelForwarded = toText(req.headers['x-forwarded-for'] || '');
  if (toText(req.headers['x-vercel-id']) && vercelForwarded) return vercelForwarded.split(',')[0].trim();
  return remote || vercelForwarded.split(',')[0]?.trim() || toText(req.headers['x-real-ip'] || '');
}

function getChallengeNamespace(req) {
  const session = requireAdminSession(req);
  if (session?.u) return `session:${session.u}`;
  const trusted = hasTrustedDevice(req);
  if (trusted?.u) return `device:${trusted.u}`;
  const ip = getClientIp(req) || 'unknown';
  const ua = toText(req.headers['user-agent'] || '');
  return `fingerprint:${hashPassword(`${ip}|${ua}`).slice(0, 20)}`;
}

export function setApiSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
}

export function sendJson(res, statusCode, payload) {
  res.status(statusCode);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(JSON.stringify(payload));
}

export function readJsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  if (typeof req.body === 'object') return req.body;
  return null;
}

export function assertSameOrigin(req) {
  const origin = toText(req.headers.origin);
  const host = toText(req.headers.host);
  if (!origin || !host) return false;
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

export function validateAdminCredentials(username, password) {
  const expectedUser = toText(process.env.ADMIN_USERNAME);
  const expectedHash = getExpectedPasswordHash();
  if (!expectedUser || !expectedHash) return false;
  const incomingUser = toText(username);
  const incomingHash = hashPassword(toText(password));
  return safeEqual(incomingUser, expectedUser) && safeEqual(incomingHash, expectedHash);
}

export function createSessionToken(username) {
  const secret = getSessionSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured.');
  const payload = JSON.stringify({ u: toText(username), exp: Date.now() + SESSION_MAX_AGE * 1000 });
  const encodedPayload = base64url(payload);
  const signature = signPayload(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token) {
  const secret = getSessionSecret();
  if (!secret || !token || !token.includes('.')) return null;
  const [encodedPayload, signature] = token.split('.');
  const expected = signPayload(encodedPayload, secret);
  if (!safeEqual(signature, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload?.u || !payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createTrustedDeviceToken(username) {
  const secret = getSessionSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured.');
  const payload = JSON.stringify({ u: toText(username), exp: Date.now() + TRUSTED_DEVICE_MAX_AGE * 1000, kind: 'device' });
  const encodedPayload = base64url(payload);
  const signature = signPayload(`device:${encodedPayload}`, secret);
  return `${encodedPayload}.${signature}`;
}

export function verifyTrustedDeviceToken(token) {
  const secret = getSessionSecret();
  if (!secret || !token || !token.includes('.')) return null;
  const [encodedPayload, signature] = token.split('.');
  const expected = signPayload(`device:${encodedPayload}`, secret);
  if (!safeEqual(signature, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload?.u || payload?.kind !== 'device' || !payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}`);
}

export function setSessionCookies(res, sessionToken, trustedDeviceToken) {
  res.setHeader('Set-Cookie', [
    `${SESSION_COOKIE}=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}`,
    `${TRUSTED_DEVICE_COOKIE}=${trustedDeviceToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TRUSTED_DEVICE_MAX_AGE}`,
  ]);
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', [
    `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
    `${TRUSTED_DEVICE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
  ]);
}

export function requireAdminSession(req) {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[SESSION_COOKIE]);
}

export function hasTrustedDevice(req) {
  const cookies = parseCookies(req);
  return verifyTrustedDeviceToken(cookies[TRUSTED_DEVICE_COOKIE]);
}

export function isAllowedAdminNetwork(req) {
  const ip = getClientIp(req);
  if (!ip) return false;
  const exact = parseCsvEnv('ADMIN_ALLOWED_IPS');
  const prefixes = parseCsvEnv('ADMIN_ALLOWED_IP_PREFIXES');
  if (exact.includes(ip)) return true;
  return prefixes.some((prefix) => ip.startsWith(prefix));
}

export function canAccessAdminEntry(req) {
  return Boolean(isAllowedAdminNetwork(req) || hasTrustedDevice(req));
}

export function isKvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export function getExpectedOrigin(req) {
  const host = toText(req.headers.host);
  const proto = toText(req.headers['x-forwarded-proto'] || '').toLowerCase() === 'http' ? 'http' : 'https';
  return `${proto}://${host}`;
}

export function getExpectedOrigins(req) {
  const configured = parseCsvEnv('ADMIN_ALLOWED_ORIGINS');
  const current = getExpectedOrigin(req);
  return Array.from(new Set([...configured, current].filter(Boolean)));
}

export function getExpectedRPID(req) {
  return toText(process.env.ADMIN_RP_ID) || toText(req.headers.host || '').split(':')[0];
}

export async function readSiteData(kind) {
  const key = kind === 'projects' ? PROJECTS_KEY : CONTENT_KEY;
  const fallbackPath = kind === 'projects' ? new URL('../public/projects.json', import.meta.url) : new URL('../content-template.json', import.meta.url);
  if (isKvConfigured()) {
    const fromKv = await kv.get(key);
    if (fromKv) return fromKv;
  }
  const raw = await readFile(fallbackPath, 'utf8');
  return JSON.parse(raw);
}

export async function writeSiteData(kind, value) {
  if (!isKvConfigured()) throw new Error('Vercel KV is required for live admin editing.');
  const key = kind === 'projects' ? PROJECTS_KEY : CONTENT_KEY;
  await kv.set(key, value);
}

export async function getStoredPasskeys() {
  if (isKvConfigured()) {
    const passkeys = await kv.get(PASSKEYS_KEY);
    return Array.isArray(passkeys) ? passkeys : [];
  }
  return Array.isArray(localPasskeyStore) ? localPasskeyStore : [];
}

export async function saveStoredPasskeys(value) {
  if (isKvConfigured()) {
    await kv.set(PASSKEYS_KEY, value);
    return;
  }
  localPasskeyStore.length = 0;
  value.forEach((item) => localPasskeyStore.push(item));
}

export async function storeAdminChallenge(req, kind, challenge) {
  const key = `${CHALLENGE_PREFIX}${kind}:${getChallengeNamespace(req)}`;
  if (isKvConfigured()) {
    await kv.set(key, challenge, { ex: 300 });
    return;
  }
  localChallengeStore.set(key, { challenge, expiresAt: Date.now() + 300000 });
}

export async function readAdminChallenge(req, kind) {
  const key = `${CHALLENGE_PREFIX}${kind}:${getChallengeNamespace(req)}`;
  if (isKvConfigured()) return (await kv.get(key)) || '';
  const entry = localChallengeStore.get(key);
  if (!entry || entry.expiresAt < Date.now()) return '';
  return entry.challenge;
}

export async function clearAdminChallenge(req, kind) {
  const key = `${CHALLENGE_PREFIX}${kind}:${getChallengeNamespace(req)}`;
  if (isKvConfigured()) {
    await kv.del(key);
    return;
  }
  localChallengeStore.delete(key);
}

export function normalizeStoredPasskey(credential) {
  return {
    id: credential.id,
    publicKey: isoBase64URL.fromBuffer(credential.publicKey),
    counter: credential.counter,
    transports: credential.transports || ['internal'],
    deviceType: credential.deviceType || 'singleDevice',
    backedUp: Boolean(credential.backedUp),
  };
}

export function hydrateStoredPasskey(passkey) {
  return {
    id: passkey.id,
    publicKey: isoBase64URL.toBuffer(passkey.publicKey),
    counter: Number(passkey.counter || 0),
    transports: Array.isArray(passkey.transports) ? passkey.transports : ['internal'],
  };
}

export const __testing = {
  hashPassword,
  validateAdminCredentials,
  createSessionToken,
  verifySessionToken,
  createTrustedDeviceToken,
  verifyTrustedDeviceToken,
  assertSameOrigin,
  isAllowedAdminNetwork,
  canAccessAdminEntry,
  getExpectedOrigin,
  getExpectedOrigins,
  getExpectedRPID,
};
