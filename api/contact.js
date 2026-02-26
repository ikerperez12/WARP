const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_REQUESTS = 6;
const MAX_NAME = 120;
const MAX_EMAIL = 180;
const MAX_TOPIC = 80;
const MAX_MESSAGE = 4000;

const rateStore = globalThis.__warpContactRateStore || new Map();
globalThis.__warpContactRateStore = rateStore;

function toText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim();
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(JSON.stringify(payload));
}

function parseRequestBody(req) {
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

function cleanupRateStore(now) {
  for (const [key, entry] of rateStore.entries()) {
    if (entry.resetAt <= now) rateStore.delete(key);
  }
}

function allowRateLimit(key, now) {
  cleanupRateStore(now);
  const current = rateStore.get(key);
  if (!current || current.resetAt <= now) {
    rateStore.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_MAX_REQUESTS) return false;
  current.count += 1;
  rateStore.set(key, current);
  return true;
}

function getClientKey(req, email) {
  const forwarded = toText(req.headers['x-forwarded-for'] || '');
  const ip = forwarded.split(',')[0]?.trim() || toText(req.headers['x-real-ip'] || 'unknown');
  return `${ip}:${email.toLowerCase()}`;
}

async function sendEmailViaResend({ topic, name, email, message }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is missing in the environment.');
  }

  const from = process.env.CONTACT_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';
  const configuredRecipients = toText(process.env.CONTACT_TO_EMAILS || '');
  const recipients = configuredRecipients
    ? configuredRecipients.split(',').map((item) => item.trim()).filter(Boolean)
    : ['iker.perez@udc.es', 'ikerjperezgarcia@gmail.com'];

  const safeTopic = escapeHtml(topic);
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);

  const payload = {
    from,
    to: recipients,
    reply_to: email,
    subject: `Portfolio contact [${topic}] - ${name}`,
    text: [
      `Topic: ${topic}`,
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      'Message:',
      message,
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
        <h2 style="margin:0 0 12px">Nuevo contacto desde portfolio</h2>
        <p><strong>Categoria:</strong> ${safeTopic}</p>
        <p><strong>Nombre:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:16px 0" />
        <p style="white-space:pre-wrap">${safeMessage}</p>
      </div>
    `,
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const failure = await response.text().catch(() => '');
    throw new Error(`Resend error ${response.status}: ${failure.slice(0, 220)}`);
  }
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  const body = parseRequestBody(req);
  const topic = toText(body.topic);
  const name = toText(body.name);
  const email = toText(body.email);
  const message = toText(body.message);
  const website = toText(body.website);

  if (website) {
    return sendJson(res, 202, { ok: true });
  }

  if (!topic || !name || !email || !message) {
    return sendJson(res, 400, { ok: false, error: 'Missing required fields.' });
  }
  if (topic.length > MAX_TOPIC || name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
    return sendJson(res, 400, { ok: false, error: 'Input is too long.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendJson(res, 400, { ok: false, error: 'Invalid email format.' });
  }

  const now = Date.now();
  const rateKey = getClientKey(req, email);
  if (!allowRateLimit(rateKey, now)) {
    return sendJson(res, 429, { ok: false, error: 'Too many requests. Try again in a minute.' });
  }

  try {
    await sendEmailViaResend({ topic, name, email, message });
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error('[api/contact] send failed', error);
    return sendJson(res, 502, { ok: false, error: 'Email delivery failed.' });
  }
}
