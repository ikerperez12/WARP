import { kv } from '@vercel/kv';

const RATE_WINDOW_MS = 60 * 1000;
const RATE_WINDOW_SECONDS = Math.ceil(RATE_WINDOW_MS / 1000);
const CLEANUP_INTERVAL_MS = 60 * 1000;
const RATE_MAX_REQUESTS = 6;
const MAX_NAME = 120;
const MAX_EMAIL = 180;
const MAX_TOPIC = 80;
const MAX_MESSAGE = 4000;
const PROVIDER_TIMEOUT_MS = 12_000;
const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const rateStore = globalThis.__warpContactRateStore || new Map();
globalThis.__warpContactRateStore = rateStore;
let kvFallbackWarned = false;

function toText(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function toSingleLine(value) {
  return toText(value).replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function toMessageText(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

function normalizeProviderErrorText(raw, fallback = 'Unknown provider error.') {
  const compact = toSingleLine(String(raw || ''));
  if (!compact) return fallback;
  return compact.slice(0, 240);
}

function getRequestSignal() {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(PROVIDER_TIMEOUT_MS);
  }
  return undefined;
}

function parseRecipientList(rawValue) {
  const list = toSingleLine(rawValue)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const unique = [];
  for (const email of list) {
    if (!EMAIL_PATTERN.test(email)) continue;
    if (!unique.includes(email)) unique.push(email);
  }
  return unique;
}

function resolveRecipients() {
  const primary = toSingleLine(process.env.CONTACT_RECIPIENT_EMAIL || '');
  const legacyList = parseRecipientList(process.env.CONTACT_TO_EMAILS || '');

  const recipients = [];
  if (EMAIL_PATTERN.test(primary)) recipients.push(primary);
  legacyList.forEach((item) => {
    if (!recipients.includes(item)) recipients.push(item);
  });

  return {
    primaryRecipient: recipients[0] || '',
    resendRecipients: recipients,
  };
}

function cleanupRateStore(now) {
  if (now - (rateStore.lastCleanup || 0) < CLEANUP_INTERVAL_MS) return;
  rateStore.lastCleanup = now;

  for (const [key, entry] of rateStore.entries()) {
    if (entry.resetAt <= now) rateStore.delete(key);
  }
}

function allowRateLimitInMemory(key, now) {
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

function isKvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function normalizeRateKey(key) {
  return String(key || 'unknown').replace(/[^a-zA-Z0-9:._-]/g, '_');
}

function getKvRateKey(key, now) {
  const bucket = Math.floor(now / RATE_WINDOW_MS);
  return `warp:contact:rate:${bucket}:${normalizeRateKey(key)}`;
}

async function allowRateLimitWithKv(key, now) {
  const rateKey = getKvRateKey(key, now);
  const count = await kv.incr(rateKey);
  if (count === 1) {
    await kv.expire(rateKey, RATE_WINDOW_SECONDS);
  }
  return count <= RATE_MAX_REQUESTS;
}

async function allowRateLimit(key, now) {
  if (!isKvConfigured()) return allowRateLimitInMemory(key, now);

  try {
    return await allowRateLimitWithKv(key, now);
  } catch (error) {
    if (!kvFallbackWarned) {
      kvFallbackWarned = true;
      console.warn('[api/contact] KV rate limiter unavailable; using in-memory fallback.', error);
    }
    return allowRateLimitInMemory(key, now);
  }
}

function getClientKey(req, email) {
  const forwarded = toSingleLine(req.headers['x-forwarded-for'] || '');
  const ip = forwarded.split(',')[0]?.trim() || toSingleLine(req.headers['x-real-ip'] || 'unknown');
  return `${ip}:${email.toLowerCase()}`;
}

function createEmailPayload({ topic, name, email, message }) {
  const safeTopic = escapeHtml(topic);
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);
  const subject = `Portfolio contact [${topic}] - ${name}`;

  return {
    subject,
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
}

async function sendEmailViaResend({ topic, name, email, message, recipients }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return {
      ok: false,
      provider: 'resend',
      code: 'resend_not_configured',
      error: 'RESEND_API_KEY is not configured.',
      skipped: true,
    };
  }
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return {
      ok: false,
      provider: 'resend',
      code: 'recipient_missing',
      error: 'No recipient email is configured for Resend.',
    };
  }

  const from = process.env.CONTACT_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';
  const content = createEmailPayload({ topic, name, email, message });
  const payload = {
    from,
    to: recipients,
    reply_to: email,
    subject: content.subject,
    text: content.text,
    html: content.html,
  };

  try {
    const signal = getRequestSignal();
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      ...(signal ? { signal } : {}),
    });

    if (!response.ok) {
      const failure = await response.text().catch(() => '');
      return {
        ok: false,
        provider: 'resend',
        code: 'resend_rejected',
        error: `Resend rejected the message (${response.status}): ${normalizeProviderErrorText(
          failure,
          'Check sender domain verification and API key.'
        )}`,
      };
    }

    return { ok: true, provider: 'resend' };
  } catch (error) {
    return {
      ok: false,
      provider: 'resend',
      code: 'resend_request_failed',
      error: normalizeProviderErrorText(error?.message, 'Resend request failed.'),
    };
  }
}

async function sendEmailViaFormSubmit({ recipient, topic, name, email, message }) {
  if (!recipient) {
    return {
      ok: false,
      provider: 'formsubmit',
      code: 'recipient_missing',
      error: 'CONTACT_RECIPIENT_EMAIL is missing for FormSubmit fallback.',
    };
  }

  const content = createEmailPayload({ topic, name, email, message });

  try {
    const signal = getRequestSignal();
    const body = new URLSearchParams({
      _subject: content.subject,
      _replyto: email,
      _captcha: 'false',
      _template: 'table',
      topic,
      name,
      email,
      message,
    });

    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: body.toString(),
      ...(signal ? { signal } : {}),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = normalizeProviderErrorText(
        payload?.message || payload?.error,
        'Check recipient activation and endpoint configuration.'
      );
      const normalized = detail.toLowerCase();
      const requiresActivation =
        response.status === 403 &&
        (normalized.includes('activate') || normalized.includes('activation') || normalized.includes('confirm'));

      return {
        ok: false,
        provider: 'formsubmit',
        code: requiresActivation ? 'formsubmit_activation_required' : 'formsubmit_rejected',
        error: requiresActivation
          ? `FormSubmit requires inbox activation (${response.status}). Open the activation email sent to ${recipient} and confirm the form.`
          : `FormSubmit rejected the message (${response.status}): ${detail}`,
      };
    }

    const success = String(payload?.success ?? '').toLowerCase();
    if (success === 'false') {
      return {
        ok: false,
        provider: 'formsubmit',
        code: 'formsubmit_failed',
        error: normalizeProviderErrorText(payload?.message, 'FormSubmit reported a failed delivery.'),
      };
    }

    return { ok: true, provider: 'formsubmit' };
  } catch (error) {
    return {
      ok: false,
      provider: 'formsubmit',
      code: 'formsubmit_request_failed',
      error: normalizeProviderErrorText(error?.message, 'FormSubmit request failed.'),
    };
  }
}

async function deliverEmailWithFallback({ topic, name, email, message }) {
  const { primaryRecipient, resendRecipients } = resolveRecipients();
  const attempts = [];

  const resendAttempt = await sendEmailViaResend({
    topic,
    name,
    email,
    message,
    recipients: resendRecipients,
  });
  attempts.push(resendAttempt);
  if (resendAttempt.ok) return { ok: true, provider: 'resend', attempts };

  const formSubmitAttempt = await sendEmailViaFormSubmit({
    recipient: primaryRecipient,
    topic,
    name,
    email,
    message,
  });
  attempts.push(formSubmitAttempt);
  if (formSubmitAttempt.ok) return { ok: true, provider: 'formsubmit', attempts };

  return { ok: false, attempts };
}

export const __testing = {
  RATE_WINDOW_MS,
  RATE_WINDOW_SECONDS,
  RATE_MAX_REQUESTS,
  rateStore,
  cleanupRateStore,
  allowRateLimitInMemory,
  allowRateLimit,
  getKvRateKey,
};

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; sandbox");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');

  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  const body = parseRequestBody(req);
  const topic = toSingleLine(body.topic);
  const name = toSingleLine(body.name);
  const email = toSingleLine(body.email);
  const message = toMessageText(body.message);
  const website = toSingleLine(body.website);

  if (website) {
    return sendJson(res, 202, { ok: true });
  }

  if (!topic || !name || !email || !message) {
    return sendJson(res, 400, { ok: false, code: 'missing_fields', error: 'topic, name, email and message are required.' });
  }
  if (topic.length > MAX_TOPIC || name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
    return sendJson(res, 400, { ok: false, code: 'input_too_long', error: 'Input exceeds allowed length limits.' });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return sendJson(res, 400, { ok: false, code: 'invalid_email', error: 'Sender email format is invalid.' });
  }

  const now = Date.now();
  const rateKey = getClientKey(req, email);
  if (!(await allowRateLimit(rateKey, now))) {
    return sendJson(res, 429, {
      ok: false,
      code: 'rate_limited',
      error: 'Too many requests. Please wait about one minute before trying again.',
    });
  }

  try {
    const result = await deliverEmailWithFallback({ topic, name, email, message });
    if (result.ok) {
      return sendJson(res, 200, { ok: true, provider: result.provider });
    }

    const attempts = result.attempts.map((attempt) => ({
      provider: attempt.provider,
      code: attempt.code,
      error: attempt.error,
      skipped: Boolean(attempt.skipped),
    }));

    const allConfigIssues = attempts.every((attempt) =>
      ['resend_not_configured', 'recipient_missing'].includes(attempt.code)
    );

    const statusCode = allConfigIssues ? 500 : 502;
    const deliveryErrorMessage = allConfigIssues
      ? 'Email service is not properly configured.'
      : 'Email delivery failed. Please try again later.';

    console.error('[api/contact] all delivery providers failed', attempts);
    return sendJson(res, statusCode, {
      ok: false,
      code: allConfigIssues ? 'provider_configuration_error' : 'email_delivery_failed',
      error: deliveryErrorMessage,
    });
  } catch (error) {
    console.error('[api/contact] send failed', error);
    return sendJson(res, 500, {
      ok: false,
      code: 'internal_error',
      error: 'Unexpected server error while sending email.',
    });
  }
}
