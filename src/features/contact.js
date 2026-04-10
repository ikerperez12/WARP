import { toText } from '../utils/helpers.js';
import { announce } from '../utils/dom.js';
import { prefs } from './preferences.js';

const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const contactStatus = document.getElementById('contact-status');
  const contactSuccess = document.getElementById('contact-success');
  const contactError = document.getElementById('contact-error');

  if (contactSuccess) contactSuccess.classList.add('is-hidden');
  if (contactError) contactError.classList.add('is-hidden');

  if (!contactForm) return;

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const submitText = submitButton?.querySelector('span');
  const messages = {
    es: {
      idle: 'Enviar mensaje',
      missing: 'Completa categoría, nombre, email y mensaje.',
      invalidEmail: 'El email no es válido.',
      sending: 'Enviando mensaje de forma segura...',
      fallbackSent: 'Mensaje enviado por plataforma de respaldo. Te responderé pronto.',
      fallbackOpened: 'Se abrió tu cliente de correo como respaldo final.',
      sent: 'Mensaje enviado. Te responderé pronto.',
      failed: 'No se pudo enviar el mensaje.',
      noFallback: 'No hay correo de destino configurado para el respaldo.',
      formSubmitActivation: 'FormSubmit requiere activar el receptor. Abre el correo de activación y confirma el formulario.',
    },
    en: {
      idle: 'Send message',
      missing: 'Complete category, name, email and message.',
      invalidEmail: 'The email is not valid.',
      sending: 'Sending message securely...',
      fallbackSent: 'Message sent through backup platform. I will reply soon.',
      fallbackOpened: 'Your mail client was opened as a final fallback.',
      sent: 'Message sent. I will reply soon.',
      failed: 'The message could not be sent.',
      noFallback: 'No fallback recipient email is configured.',
      formSubmitActivation: 'FormSubmit requires recipient activation. Open the activation email and confirm the form.',
    },
  };
  const getCopy = () => messages[prefs.lang] || messages.es;
  const idleText = submitText?.textContent || getCopy().idle;
  const fallbackMailLink = document.querySelector('.contact-card a[href^="mailto:"]');
  const fallbackRecipient = (() => {
    const href = toText(fallbackMailLink?.getAttribute('href') || '');
    if (!href.toLowerCase().startsWith('mailto:')) return '';
    return toText(href.slice(7).split('?')[0]);
  })();

  const setFormStatus = (message, mode) => {
    if (!contactStatus) return;
    contactStatus.textContent = message;
    contactStatus.classList.remove('is-success', 'is-error');
    if (mode === 'success') contactStatus.classList.add('is-success');
    if (mode === 'error') contactStatus.classList.add('is-error');
  };

  const sendViaFormSubmitClient = async ({ topic, name, email, message }) => {
    if (!fallbackRecipient) throw new Error(getCopy().noFallback);

    const body = new URLSearchParams({
      _subject: `Portfolio contact [${topic}] - ${name}`,
      _replyto: email,
      _template: 'table',
      _captcha: 'false',
      topic,
      name,
      email,
      message,
    });

    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(fallbackRecipient)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', Accept: 'application/json' },
      body: body.toString(),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = toText(payload?.message || payload?.error, `Error ${response.status}`);
      const normalized = detail.toLowerCase();
      if (response.status === 403 && (normalized.includes('activate') || normalized.includes('activation'))) {
        throw new Error(getCopy().formSubmitActivation);
      }
      throw new Error(`FormSubmit falló: ${detail}`);
    }

    const successFlag = String(payload?.success ?? '').toLowerCase();
    if (successFlag === 'false') {
      throw new Error(toText(payload?.message, 'FormSubmit reportó un fallo de entrega.'));
    }
  };

  const openMailtoDraft = ({ topic, name, email, message }) => {
    if (!fallbackRecipient) return false;
    const subject = encodeURIComponent(`Portfolio contact [${topic}] - ${name}`);
    const body = encodeURIComponent([
      `Categoría: ${topic}`,
      `Nombre: ${name}`,
      `Email: ${email}`,
      '',
      'Mensaje:',
      message,
    ].join('\n'));
    window.location.href = `mailto:${fallbackRecipient}?subject=${subject}&body=${body}`;
    return true;
  };

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const topic = toText(contactForm.querySelector('#topic')?.value || '');
    const name = toText(contactForm.querySelector('#name')?.value || '');
    const email = toText(contactForm.querySelector('#email')?.value || '');
    const message = toText(contactForm.querySelector('#message')?.value || '');
    const website = toText(contactForm.querySelector('#website')?.value || '');
    if (contactSuccess) contactSuccess.classList.add('is-hidden');
    if (contactError) contactError.classList.add('is-hidden');

    if (!topic || !name || !email || !message) {
      setFormStatus(getCopy().missing, 'error');
      if (contactError) contactError.classList.remove('is-hidden');
      announce('Contact form has missing fields.');
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setFormStatus(getCopy().invalidEmail, 'error');
      announce('Invalid email format.');
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add('is-loading');
    }
    if (submitText) submitText.textContent = getCopy().sending;
    setFormStatus(getCopy().sending, '');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ topic, name, email, message, website }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const code = toText(payload?.code);
        const shouldTryBrowserFallback =
          code === 'provider_configuration_error' ||
          code === 'email_delivery_failed' ||
          response.status >= 500;

        if (shouldTryBrowserFallback) {
          try {
            await sendViaFormSubmitClient({ topic, name, email, message });
            setFormStatus(getCopy().fallbackSent, 'success');
            if (contactSuccess) contactSuccess.classList.remove('is-hidden');
            contactForm.reset();
            announce('Message sent successfully via fallback provider.');
            return;
          } catch (fallbackError) {
            const fallbackMessage = toText(fallbackError?.message, '');
            if (fallbackMessage) {
              const opened = openMailtoDraft({ topic, name, email, message });
              if (opened) {
                setFormStatus(
                  `${fallbackMessage} ${getCopy().fallbackOpened}`,
                  'error'
                );
                if (contactError) contactError.classList.remove('is-hidden');
                announce('Mail client fallback opened.');
                return;
              }
            }
            throw fallbackError;
          }
        }

        throw new Error(toText(payload?.error, `Error ${response.status}`));
      }
      setFormStatus(getCopy().sent, 'success');
      if (contactSuccess) contactSuccess.classList.remove('is-hidden');
      contactForm.reset();
      announce('Message sent successfully.');
    } catch (error) {
      setFormStatus(toText(error.message, getCopy().failed), 'error');
      if (contactError) contactError.classList.remove('is-hidden');
      announce('Message send failed.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('is-loading');
      }
      if (submitText) submitText.textContent = getCopy().idle || idleText;
    }
  });
}
