import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import "./BackToTop.css";

export default function BackToTop() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 640px)");
    const onScroll = () => {
      setVisible(window.scrollY > 600);

      const contact = document.getElementById("contact");
      if (!mobileQuery.matches || !contact) {
        setContactVisible(false);
        return;
      }

      const rect = contact.getBoundingClientRect();
      setContactVisible(rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.12);
    };

    const onMediaChange = () => onScroll();

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    mobileQuery.addEventListener("change", onMediaChange);
    return () => {
      window.removeEventListener("scroll", onScroll);
      mobileQuery.removeEventListener("change", onMediaChange);
    };
  }, []);

  const up = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label={t.misc.backTop}
      className={`back-to-top ${visible ? "is-visible" : ""} ${contactVisible ? "is-contact-visible" : ""}`}
      onClick={up}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M12 5l7 7-1.4 1.4L13 8.8V20h-2V8.8l-4.6 4.6L5 12z" fill="currentColor" />
      </svg>
    </button>
  );
}
