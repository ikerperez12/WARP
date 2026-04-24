import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useI18n } from "../i18n/I18nProvider.jsx";
import Magnetic from "../visuals/Magnetic.jsx";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./HeroSection.css";

export default function HeroSection() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray(".hero-reveal");

      if (reduced) {
        gsap.set(nodes, { clearProps: "opacity,transform" });
        return;
      }

      gsap.fromTo(
        nodes,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.3,
          clearProps: "opacity,transform",
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="hero" className="hero" ref={containerRef}>
      <div className="hero-vignette" aria-hidden="true" />

      <div className="hero-content">
        <p className="hero-kicker hero-reveal">{t.hero.kicker}</p>

        <h1 className="hero-title">
          <span className="hero-title-line-1 hero-reveal">{t.hero.lines[0]}</span>
          <span className="hero-title-line-2 hero-reveal">{t.hero.lines[1]}</span>
        </h1>

        <div className="hero-badge hero-reveal">
          <span className="hero-badge-dot" />
          <span>{t.hero.badge}</span>
        </div>

        <p className="hero-description hero-reveal">{t.hero.description}</p>

        <div className="hero-ctas hero-reveal">
          <Magnetic strength={0.35}>
            <a href="#projects" className="hero-cta hero-cta-primary">
              <span>{t.hero.ctas[0]}</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M5 12h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </a>
          </Magnetic>
          <Magnetic strength={0.3}>
            <a href="#contact" className="hero-cta hero-cta-ghost">
              <span>{t.hero.ctas[1]}</span>
            </a>
          </Magnetic>
        </div>

        <div className="hero-chips hero-reveal" role="list">
          {t.hero.chips.map((chip) => (
            <span key={chip} className="hero-chip" role="listitem">
              {chip}
            </span>
          ))}
        </div>
      </div>

      <a href="#about" className="hero-scroll-hint" aria-label="Scroll">
        <span />
      </a>
    </section>
  );
}
