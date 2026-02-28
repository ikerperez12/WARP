import { kv } from '@vercel/kv';
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const SESSION_COOKIE = 'warp_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 8;
const CONTENT_KEY = 'warp:site:content';
const PROJECTS_KEY = 'warp:site:projects';

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
      return {};
    }
  }
  if (typeof req.body === 'object') return req.body;
  return {};
}

export function assertSameOrigin(req) {
  const origin = toText(req.headers.origin);
  const host = toText(req.headers.host);
  if (!origin || !host) return true;

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

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}`);
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}

export function requireAdminSession(req) {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[SESSION_COOKIE]);
}

export function isKvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
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
  if (!isKvConfigured()) {
    throw new Error('Vercel KV is required for live admin editing.');
  }
  const key = kind === 'projects' ? PROJECTS_KEY : CONTENT_KEY;
  await kv.set(key, value);
}

export const __testing = {
  hashPassword,
  validateAdminCredentials,
  createSessionToken,
  verifySessionToken,
  assertSameOrigin,
};

