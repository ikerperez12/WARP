import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./VideoCurtain.css";

gsap.registerPlugin(ScrollTrigger);

const CLOSED = "ellipse(10vw 14vh at 50% 50%)";
const OPEN = "ellipse(160vw 160vh at 50% 50%)";

/**
 * VideoCurtain — iris open / hold / close, scrub-driven, NO pin.
 *
 * Layout:
 *   .video-curtain        — outer 240vh (gives room for full iris arc)
 *     .video-curtain-stage — sticky top:0, height:100vh (the visible frame)
 *       .video-curtain-clip — absolute inset:0, clip-path iris animates
 *       .video-curtain-text — absolute center
 *
 * Trigger spans section top → bottom crossing viewport, total scroll = 240vh
 * (section) + 100vh (viewport) = 340vh. Sticky is pinned for the middle 100vh,
 * which maps to trigger progress ~0.29 → ~0.71.
 *
 * Timeline (symmetric around sticky window):
 *   0.00–0.20  closed (pre-entry)
 *   0.20–0.45  iris opens  — user watches the oval grow as section rises
 *   0.40–0.55  text in
 *   0.45–0.60  hold fully open (text visible during sticky peak)
 *   0.55–0.70  text out
 *   0.60–0.85  iris closes — user watches the oval shrink as section exits
 *   0.85–1.00  closed (post-exit)
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
      gsap.set(text, { opacity: 0, scale: 0.9, y: 20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // phase 1: iris OPENS (0.20 → 0.45)
      tl.to(media, {
        clipPath: OPEN,
        webkitClipPath: OPEN,
        ease: "power2.out",
        duration: 0.25,
      }, 0.20);

      // text fades in (0.40 → 0.52)
      tl.to(text, {
        opacity: 1,
        scale: 1,
        y: 0,
        ease: "power2.out",
        duration: 0.12,
      }, 0.40);

      // hold (0.52 → 0.58)
      tl.to({}, { duration: 0.06 }, 0.52);

      // text fades out (0.58 → 0.70)
      tl.to(text, {
        opacity: 0,
        scale: 0.95,
        y: -15,
        ease: "power2.in",
        duration: 0.12,
      }, 0.58);

      // phase 2: iris CLOSES (0.60 → 0.85)
      tl.to(media, {
        clipPath: CLOSED,
        webkitClipPath: CLOSED,
        ease: "power2.in",
        duration: 0.25,
      }, 0.60);
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
