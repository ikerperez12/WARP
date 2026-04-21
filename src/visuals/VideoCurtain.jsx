import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./VideoCurtain.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * VideoCurtain — GSAP pin + scrub pattern (the "Estrellas" way).
 *
 * The section is 100vh tall in normal flow. When its top hits the viewport
 * top, GSAP pins it (inserting a pin-spacer that extends document height),
 * and the clip-path iris animates from closed → open → hold → close as the
 * user scrolls through the pin window.
 *
 * Critical: with pin: true, the user CANNOT skip the animation no matter how
 * fast they scroll — they must traverse the pinned scroll distance first.
 *
 * Timeline (0 → 1 over the pinned scroll length):
 *   0.00 – 0.30 iris OPENS     (small ellipse → huge ellipse)
 *   0.25 – 0.40 text FADES IN
 *   0.40 – 0.60 HOLD (fully open, text visible)
 *   0.60 – 0.75 text FADES OUT
 *   0.70 – 1.00 iris CLOSES    (huge → small ellipse)
 *
 * `end: "+=200%"` means the pinned scroll is 2× viewport height, giving the
 * user plenty of wheel travel to perceive open + hold + close distinctly.
 */

const CLOSED = "ellipse(15vw 20vh at 50% 50%)";
const OPEN = "ellipse(160vw 160vh at 50% 50%)";

export default function VideoCurtain({
  id,
  src,
  poster,
  kicker,
  title,
  subtitle,
  lines = [],
  pinLength = "+=220%",
}) {
  const curtainRef = useRef(null);
  const mediaRef = useRef(null);
  const textRef = useRef(null);
  const videoRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = curtainRef.current;
    const media = mediaRef.current;
    const text = textRef.current;
    const video = videoRef.current;
    if (!section || !media || !text) return;

    if (reduced) {
      media.style.clipPath = OPEN;
      media.style.webkitClipPath = OPEN;
      text.style.opacity = "1";
      video?.play?.().catch(() => {});
      return;
    }

    video?.play?.().catch(() => {});

    const ctx = gsap.context(() => {
      gsap.set(media, { clipPath: CLOSED, webkitClipPath: CLOSED });
      gsap.set(text, { opacity: 0, scale: 0.9, y: 30 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: pinLength,
          scrub: true,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => video?.play?.().catch(() => {}),
          onEnterBack: () => video?.play?.().catch(() => {}),
        },
      });

      tl
        // 0.00 → 0.22 iris opens (fast open, feels eager)
        .to(media, {
          clipPath: OPEN,
          webkitClipPath: OPEN,
          ease: "power2.out",
          duration: 0.22,
        }, 0)
        // 0.18 → 0.30 text fades in
        .to(text, {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: "power2.out",
          duration: 0.12,
        }, 0.18)
        // 0.30 → 0.55 hold fully open with text
        .to({}, { duration: 0.25 }, 0.30)
        // 0.55 → 0.65 text fades out
        .to(text, {
          opacity: 0,
          scale: 0.95,
          y: -20,
          ease: "power2.in",
          duration: 0.10,
        }, 0.55)
        // 0.60 → 1.00 iris closes (40% of pin — impossible to miss)
        .to(media, {
          clipPath: CLOSED,
          webkitClipPath: CLOSED,
          ease: "power2.inOut",
          duration: 0.40,
        }, 0.60);
    }, section);

    return () => ctx.revert();
  }, [pinLength, reduced]);

  return (
    <section id={id} ref={curtainRef} className="video-curtain" aria-label={title}>
      <div className="video-curtain-clip" ref={mediaRef}>
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={poster}
        />
        <div className="video-curtain-overlay" />
      </div>

      <div className="video-curtain-text" ref={textRef}>
        {kicker && <p className="video-curtain-kicker">{kicker}</p>}
        <h2 className="video-curtain-title">{title}</h2>
        {subtitle && <p className="video-curtain-subtitle">{subtitle}</p>}
        {lines.length > 0 && (
          <ul className="video-curtain-lines">
            {lines.map((line, i) => (
              <li key={i}>
                <span aria-hidden="true">//</span>
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="video-curtain-corners" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
    </section>
  );
}
