import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./VideoTransition.css";

export default function VideoTransition({
  id,
  src,
  kicker,
  title,
  subtitle,
  lines = [],
  align = "center",
  overlayOpacity = 0.55,
  poster,
}) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduced) return;
    if (inView) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [inView, reduced]);

  return (
    <section
      id={id}
      className={`video-transition video-align-${align}`}
      ref={ref}
      aria-label={title}
    >
      <div className="video-transition-bg" aria-hidden="true">
        {!reduced && (
          <video
            ref={videoRef}
            src={src}
            muted
            loop
            playsInline
            preload="metadata"
            poster={poster}
          />
        )}
        <div
          className="video-transition-overlay"
          style={{ "--overlay-opacity": overlayOpacity }}
        />
        <div className="video-transition-grain" aria-hidden="true" />
      </div>

      <div className="video-transition-content">
        {kicker && <p className="video-transition-kicker">{kicker}</p>}
        <h2 className="video-transition-title">{title}</h2>
        {subtitle && <p className="video-transition-subtitle">{subtitle}</p>}
        {lines.length > 0 && (
          <ul className="video-transition-lines">
            {lines.map((line, i) => (
              <li key={i} style={{ "--i": i }}>
                <span className="video-transition-line-mark" aria-hidden="true">//</span>
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="video-transition-corners" aria-hidden="true">
        <span className="video-corner video-corner-tl" />
        <span className="video-corner video-corner-tr" />
        <span className="video-corner video-corner-bl" />
        <span className="video-corner video-corner-br" />
      </div>
    </section>
  );
}
