import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./VideoCurtain.css";

gsap.registerPlugin(ScrollTrigger);

const CLOSED = "ellipse(10vw 14vh at 50% 50%)";
const OPEN = "ellipse(160vw 160vh at 50% 50%)";

/**
 * VideoCurtain — iris-style video reveal WITHOUT scroll hijacking.
 *
 * Structure:
 *   .video-curtain (140vh tall outer section)
 *     .video-curtain-sticky (sticky top:0, height: 100vh)
 *       .video-curtain-clip (absolute inset:0, clip-path oval animates)
 *         <video>, overlay
 *       .video-curtain-text (absolute, centered over clip)
 *
 * Timeline is scrub-bound to the section crossing the viewport, but NO pin.
 * The oval opens as the section enters and closes as it leaves, at whatever
 * speed the user scrolls.
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

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.4,
        },
      });

      tl.to(media, {
        clipPath: OPEN,
        webkitClipPath: OPEN,
        ease: "power2.out",
        duration: 0.3,
      }, 0);

      tl.to(text, {
        opacity: 1,
        scale: 1,
        y: 0,
        ease: "power2.out",
        duration: 0.25,
      }, 0.18);

      tl.to({}, { duration: 0.2 }, 0.45);

      tl.to(text, {
        opacity: 0,
        scale: 0.95,
        y: -15,
        ease: "power2.in",
        duration: 0.2,
      }, 0.62);

      tl.to(media, {
        clipPath: CLOSED,
        webkitClipPath: CLOSED,
        ease: "power2.in",
        duration: 0.3,
      }, 0.7);
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
      <div className="video-curtain-sticky">
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
      </div>
    </section>
  );
}
