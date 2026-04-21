const RATE_WINDOW_MS = 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;
const RATE_MAX_REQUESTS = 6;
const MAX_NAME = 120;
const MAX_EMAIL = 180;
const MAX_TOPIC = 80;
const MAX_MESSAGE = 4000;
const PROVIDER_TIMEOUT_MS = 12_000;
const PUBLIC_FALLBACK_EMAIL = 'iker.perez@udc.es';
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const rateStore = globalThis.__warpCfContactRateStore || new Map();
globalThis.__warpCfContactRateStore = rateStore;

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
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function jsonResponse(status, payload) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; sandbox",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
  });
  return new Response(JSON.stringify(payload), { status, headers });
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

function resolveRecipients(env) {
  const primary = toSingleLine(env.CONTACT_RECIPIENT_EMAIL || env.PUBLIC_CONTACT_EMAIL || PUBLIC_FALLBACK_EMAIL);
  const legacyList = parseRecipientList(env.CONTACT_TO_EMAILS || '');
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

function getClientKey(request, email) {
  const ip =
    toSingleLine(request.headers.get('cf-connecting-ip') || '') ||
    toSingleLine(request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() ||
    toSingleLine(request.headers.get('x-real-ip') || 'unknown');
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
    text: [`Topic: ${topic}`, `Name: ${name}`, `Email: ${email}`, '', 'Message:', message].join('\n'),
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

async function sendEmailViaResend({ env, topic, name, email, message, recipients }) {
  const resendApiKey = env.RESEND_API_KEY;
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

  const from = env.CONTACT_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';
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

async function deliverEmailWithFallback({ env, topic, name, email, message }) {
  const { primaryRecipient, resendRecipients } = resolveRecipients(env);
  const attempts = [];

  const resendAttempt = await sendEmailViaResend({
    env,
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

async function handleContact(request, env) {
  if (request.method !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'Method not allowed.' });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const topic = toSingleLine(body.topic);
  const name = toSingleLine(body.name);
  const email = toSingleLine(body.email);
  const message = toMessageText(body.message);
  const website = toSingleLine(body.website);

  if (website) return jsonResponse(202, { ok: true });

  if (!topic || !name || !email || !message) {
    return jsonResponse(400, { ok: false, code: 'missing_fields', error: 'topic, name, email and message are required.' });
  }
  if (topic.length > MAX_TOPIC || name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
    return jsonResponse(400, { ok: false, code: 'input_too_long', error: 'Input exceeds allowed length limits.' });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return jsonResponse(400, { ok: false, code: 'invalid_email', error: 'Sender email format is invalid.' });
  }

  const now = Date.now();
  const rateKey = getClientKey(request, email);
  if (!allowRateLimitInMemory(rateKey, now)) {
    return jsonResponse(429, {
      ok: false,
      code: 'rate_limited',
      error: 'Too many requests. Please wait about one minute before trying again.',
    });
  }

  try {
    const result = await deliverEmailWithFallback({ env, topic, name, email, message });
    if (result.ok) return jsonResponse(200, { ok: true, provider: result.provider });

    const attempts = result.attempts.map((attempt) => ({
      provider: attempt.provider,
      code: attempt.code,
      error: attempt.error,
      skipped: Boolean(attempt.skipped),
    }));
    const allConfigIssues = attempts.every((attempt) => ['resend_not_configured', 'recipient_missing'].includes(attempt.code));

    console.error('[worker/contact] all delivery providers failed', attempts);
    return jsonResponse(allConfigIssues ? 500 : 502, {
      ok: false,
      code: allConfigIssues ? 'provider_configuration_error' : 'email_delivery_failed',
      error: allConfigIssues ? 'Email service is not properly configured.' : 'Email delivery failed. Please try again later.',
    });
  } catch (error) {
    console.error('[worker/contact] send failed', error);
    return jsonResponse(500, {
      ok: false,
      code: 'internal_error',
      error: 'Unexpected server error while sending email.',
    });
  }
}

function maybeRedirectCanonical(request) {
  const url = new URL(request.url);
  let shouldRedirect = false;

  if (url.hostname === 'www.nexoip.click') {
    url.hostname = 'nexoip.click';
    shouldRedirect = true;
  }

  if (url.pathname === '/experience.html' || url.pathname === '/warp-folio.html') {
    url.pathname = '/';
    shouldRedirect = true;
  }

  return shouldRedirect ? Response.redirect(url.toString(), 301) : null;
}

export default {
  async fetch(request, env) {
    const canonicalRedirect = maybeRedirectCanonical(request);
    if (canonicalRedirect) return canonicalRedirect;

    const url = new URL(request.url);
    if (url.pathname === '/api/contact') {
      return handleContact(request, env);
    }

    if (url.pathname === '/visuals') {
      const rewrittenUrl = new URL(request.url);
      rewrittenUrl.pathname = '/visuals/';
      return env.ASSETS.fetch(new Request(rewrittenUrl, request));
    }

    return env.ASSETS.fetch(request);
  },
};
