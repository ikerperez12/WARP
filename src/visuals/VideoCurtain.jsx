import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./VideoCurtain.css";

gsap.registerPlugin(ScrollTrigger);

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
      media.style.clipPath = "ellipse(150vw 150vh at 50% 50%)";
      media.style.webkitClipPath = "ellipse(150vw 150vh at 50% 50%)";
      text.style.opacity = "1";
      video?.play?.().catch(() => {});
      return;
    }

    video?.play?.().catch(() => {});

    const ctx = gsap.context(() => {
      gsap.set(media, {
        clipPath: "ellipse(15vw 20vh at 50% 50%)",
        webkitClipPath: "ellipse(15vw 20vh at 50% 50%)",
      });
      gsap.set(text, { opacity: 0, scale: 0.85 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=200%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        media,
        { clipPath: "ellipse(15vw 20vh at 50% 50%)", webkitClipPath: "ellipse(15vw 20vh at 50% 50%)" },
        {
          clipPath: "ellipse(150vw 150vh at 50% 50%)",
          webkitClipPath: "ellipse(150vw 150vh at 50% 50%)",
          ease: "power2.inOut",
          duration: 1,
        }
      ).to(
        text,
        { opacity: 1, scale: 1.15, ease: "power2.out", duration: 0.5 },
        "-=0.5"
      ).to(
        text,
        { opacity: 0.92, scale: 1, ease: "none", duration: 0.35 },
        ">"
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
