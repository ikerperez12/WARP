import { useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { CONTACT_INFO } from "../i18n/copy.js";
import SectionFrame from "../components/SectionFrame.jsx";
import Magnetic from "../visuals/Magnetic.jsx";
import "./ContactSection.css";

const STATE = { idle: "idle", sending: "sending", success: "success", error: "error" };

export default function ContactSection() {
  const { t, lang } = useI18n();
  const [status, setStatus] = useState(STATE.idle);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("website")) return;

    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      message: String(data.get("message") || "").trim(),
      topic: String(data.get("topic") || "").trim(),
      lang,
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus(STATE.error);
      setErrorMessage(t.contact.error);
      return;
    }

    setStatus(STATE.sending);
    setErrorMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus(STATE.success);
      form.reset();
    } catch (err) {
      setStatus(STATE.error);
      setErrorMessage(t.contact.error);
    }
  };

  const cards = [
    {
      label: t.contact.cardTitles[0],
      value: CONTACT_INFO.email,
      href: `mailto:${CONTACT_INFO.email}`,
      icon: "✉",
    },
    {
      label: t.contact.cardTitles[1],
      value: CONTACT_INFO.githubHandle,
      href: CONTACT_INFO.github,
      icon: "⌘",
    },
    {
      label: t.contact.cardTitles[2],
      value: CONTACT_INFO.linkedinHandle,
      href: CONTACT_INFO.linkedin,
      icon: "◎",
    },
    {
      label: t.contact.cardTitles[3],
      value: t.contact.availabilityValue,
      text: t.contact.availabilityText,
      icon: "◐",
    },
  ];

  return (
    <SectionFrame
      id="contact"
      kicker={t.sections.contactTitle}
      title={t.sections.contactTitle}
      subtitle={t.sections.contactSubtitle}
      className="contact-section"
    >
      <div className="contact-grid">
        <div className="contact-info">
          {cards.map((card, i) => {
            const CardWrapper = card.href ? "a" : "div";
            return (
              <CardWrapper
                key={card.label}
                {...(card.href ? { href: card.href, target: card.href.startsWith("http") ? "_blank" : undefined, rel: card.href.startsWith("http") ? "noopener noreferrer" : undefined } : {})}
                className="contact-card"
              >
                <span className="contact-card-icon" aria-hidden="true">{card.icon}</span>
                <div>
                  <span className="contact-card-label">{card.label}</span>
                  <span className="contact-card-value">{card.value}</span>
                  {card.text && <span className="contact-card-text">{card.text}</span>}
                </div>
              </CardWrapper>
            );
          })}
        </div>

        <form className="contact-form" onSubmit={onSubmit} noValidate>
          <div className="contact-form-row">
            <label className="contact-field">
              <span>{t.contact.nameLabel}</span>
              <input type="text" name="name" required placeholder={t.contact.namePlaceholder} autoComplete="name" />
            </label>
            <label className="contact-field">
              <span>{t.contact.emailLabel}</span>
              <input type="email" name="email" required placeholder={t.contact.emailPlaceholder} autoComplete="email" />
            </label>
          </div>

          <label className="contact-field">
            <span>{t.contact.topicLabel}</span>
            <select name="topic" defaultValue="">
              <option value="" disabled>{t.contact.topicPlaceholder}</option>
              {t.contact.topicOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>

          <label className="contact-field">
            <span>{t.contact.messageLabel}</span>
            <textarea name="message" required rows={5} placeholder={t.contact.messagePlaceholder} />
          </label>

          <label className="contact-field contact-honeypot" aria-hidden="true">
            <span>{t.contact.websiteLabel}</span>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>

          <Magnetic strength={0.25}>
            <button
              type="submit"
              className="contact-submit"
              disabled={status === STATE.sending}
            >
              {status === STATE.sending ? t.contact.submitting : t.contact.submit}
            </button>
          </Magnetic>

          <div className="contact-feedback" role="status" aria-live="polite">
            {status === STATE.success && <span className="contact-ok">✓ {t.contact.success}</span>}
            {status === STATE.error && <span className="contact-ko">✕ {errorMessage || t.contact.error}</span>}
          </div>
        </form>
      </div>
    </SectionFrame>
  );
}
