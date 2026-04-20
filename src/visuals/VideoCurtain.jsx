import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./VideoCurtain.css";

gsap.registerPlugin(ScrollTrigger);

const CLOSED = "ellipse(12vw 16vh at 50% 50%)";
const OPEN = "ellipse(160vw 160vh at 50% 50%)";

/**
 * VideoCurtain — iris-style video reveal.
 *
 * NO pinning. NO scroll hijacking. The section is 120vh tall and the iris
 * animation is scrub-bound to the section's position in the viewport. As the
 * user scrolls, the oval expands while the section crosses the screen and
 * closes again as it leaves. User can scroll through at any speed, it will
 * feel natural because the iris simply tracks scroll position.
 */
export default function VideoCurtain({
  id,
  src,
  poster,
  kicker,
  title,
  subtitle,
  lines = [],
  align = "center",
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
      gsap.set(text, { opacity: 0, scale: 0.92, y: 20 });

      // Scrub-bound timeline without pin. Triggered by the section crossing
      // the viewport. Fast scroll = fast animation. Slow scroll = slow animation.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.4,
        },
      });

      // 0 -> 0.30: oval opens as section enters viewport
      tl.to(
        media,
        {
          clipPath: OPEN,
          webkitClipPath: OPEN,
          ease: "power2.out",
          duration: 0.3,
        },
        0
      );

      // 0.15 -> 0.40: text fades in
      tl.to(
        text,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: "power2.out",
          duration: 0.25,
        },
        0.15
      );

      // 0.40 -> 0.60: hold (empty time so user can read)
      tl.to({}, { duration: 0.2 }, 0.4);

      // 0.60 -> 0.85: text fades out
      tl.to(
        text,
        {
          opacity: 0,
          scale: 0.95,
          y: -15,
          ease: "power2.in",
          duration: 0.25,
        },
        0.6
      );

      // 0.70 -> 1.00: oval closes as section exits
      tl.to(
        media,
        {
          clipPath: CLOSED,
          webkitClipPath: CLOSED,
          ease: "power2.in",
          duration: 0.3,
        },
        0.7
      );
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id={id}
      ref={curtainRef}
      className={`video-curtain video-curtain-${align}`}
      aria-label={title}
    >
      <div className="video-curtain-stage">
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
      </div>

      <div className="video-curtain-text" ref={textRef}>
        {kicker && <p className="video-curtain-kicker">{kicker}</p>}
        <h2 className="video-curtain-title">{title}</h2>
        {subtitle && <p className="video-curtain-subtitle">{subtitle}</p>}
        {lines.length > 0 && (
          <ul className="video-curtain-lines">
            {lines.map((line, i) => (
              <li key={i} style={{ "--i": i }}>
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
