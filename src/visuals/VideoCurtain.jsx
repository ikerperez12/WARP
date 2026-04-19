import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./VideoCurtain.css";

gsap.registerPlugin(ScrollTrigger);

const CLOSED = "ellipse(12vw 16vh at 50% 50%)";
const OPEN = "ellipse(160vw 160vh at 50% 50%)";

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
      gsap.set(text, { opacity: 0, scale: 0.88, y: 30 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=100%",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 0 -> 0.35: oval expands to fill screen (iris opens)
      tl.to(media, {
        clipPath: OPEN,
        webkitClipPath: OPEN,
        ease: "power2.inOut",
        duration: 0.35,
      }, 0);

      // 0.15 -> 0.45: text fades in and scales up as oval approaches full
      tl.to(text, {
        opacity: 1,
        scale: 1,
        y: 0,
        ease: "power2.out",
        duration: 0.3,
      }, 0.15);

      // 0.45 -> 0.65: hold — video plays fullscreen with text visible
      tl.to({}, { duration: 0.2 }, 0.45);

      // 0.65 -> 0.85: text fades out and scales down
      tl.to(text, {
        opacity: 0,
        scale: 0.92,
        y: -20,
        ease: "power2.in",
        duration: 0.2,
      }, 0.65);

      // 0.7 -> 1.0: oval closes back (iris closes)
      tl.to(media, {
        clipPath: CLOSED,
        webkitClipPath: CLOSED,
        ease: "power2.inOut",
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
