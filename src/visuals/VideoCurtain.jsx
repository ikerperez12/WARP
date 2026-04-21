import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./VideoCurtain.css";

gsap.registerPlugin(ScrollTrigger);

const CLOSED = "ellipse(10vw 14vh at 50% 50%)";
const OPEN = "ellipse(160vw 160vh at 50% 50%)";

/**
 * VideoCurtain
 *
 * Layout:
 *   .video-curtain (200vh tall outer section)
 *     .video-curtain-stage (sticky top:0, height:100vh — holds video centered on viewport)
 *       .video-curtain-clip (absolute inset:0, clip-path animates open→hold→closed)
 *       .video-curtain-text (absolute, centered over clip)
 *
 * Scroll arithmetic (section 200vh + viewport 100vh = 300vh of scroll trigger span):
 *   progress 0.00  — section top at viewport bottom (pre-sticky)
 *   progress 0.33  — section top at viewport top (sticky locks)
 *   progress 0.67  — section has moved up 100vh, sticky unlocks
 *   progress 1.00  — section bottom at viewport top
 *
 * Iris timeline aligned to sticky-active window (0.33–0.67):
 *   0.00–0.33 closed  (pre-viewport)
 *   0.33–0.45 opening (iris opens while section fills screen)
 *   0.45–0.55 open + text in
 *   0.55–0.60 text out
 *   0.55–0.67 closing
 *   0.67–1.00 closed  (post-sticky)
 *
 * No pin: true. No scroll hijacking. Native scroll + CSS sticky + GSAP scrub.
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
          scrub: 0.35,
        },
      });

      // 0 → 0.33 closed (empty bar)
      tl.to({}, { duration: 0.33 }, 0);

      // 0.33 → 0.45 iris opens
      tl.to(media, {
        clipPath: OPEN,
        webkitClipPath: OPEN,
        ease: "power2.inOut",
        duration: 0.12,
      }, 0.33);

      // 0.40 → 0.48 text fades in
      tl.to(text, {
        opacity: 1,
        scale: 1,
        y: 0,
        ease: "power2.out",
        duration: 0.08,
      }, 0.40);

      // 0.48 → 0.55 hold (fully open with text)
      tl.to({}, { duration: 0.07 }, 0.48);

      // 0.55 → 0.60 text fades out
      tl.to(text, {
        opacity: 0,
        scale: 0.95,
        y: -15,
        ease: "power2.in",
        duration: 0.05,
      }, 0.55);

      // 0.55 → 0.67 iris closes
      tl.to(media, {
        clipPath: CLOSED,
        webkitClipPath: CLOSED,
        ease: "power2.inOut",
        duration: 0.12,
      }, 0.55);
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
