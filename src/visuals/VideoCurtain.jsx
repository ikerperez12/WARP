import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./VideoCurtain.css";

gsap.registerPlugin(ScrollTrigger);

const CLOSED = { x: 18, y: 22 };
const CLOSED_END = { x: 10, y: 14 };
const OPEN = { x: 160, y: 160 };

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mix = (from, to, progress) => from + (to - from) * progress;
const ellipse = ({ x, y }) => `ellipse(${x}vw ${y}vh at 50% 50%)`;

export default function VideoCurtain({
  id,
  src,
  poster,
  kicker,
  title,
  subtitle,
  lines = [],
  entryVh = 10,
  openVh = 68,
  holdVh = 92,
  closeVh = 82,
  tailVh = 30,
  preload = "metadata",
}) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const mediaRef = useRef(null);
  const textRef = useRef(null);
  const videoRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const media = mediaRef.current;
    const text = textRef.current;
    const video = videoRef.current;
    if (!section || !stage || !media || !text) return;

    if (reduced) {
      section.style.removeProperty("height");
      gsap.set(stage, { clearProps: "opacity,transform" });
      gsap.set(media, { clipPath: ellipse(OPEN), webkitClipPath: ellipse(OPEN) });
      gsap.set(text, { autoAlpha: 1, scale: 1, y: 0 });
      video?.play?.().catch(() => {});
      return;
    }

    const ctx = gsap.context(() => {
      let entry = 0;
      let open = 0;
      let hold = 0;
      let close = 0;
      let tail = 0;
      let total = 0;

      const applyState = (offset) => {
        const actionOffset = clamp(offset - entry, 0, open + hold + close);
        const holdStart = open;
        const closeStart = open + hold;
        const closeEnd = open + hold + close;
        const entryProgress = clamp(offset / Math.max(entry, 1), 0, 1);
        const tailProgress = clamp((offset - entry - open - hold - close) / Math.max(tail, 1), 0, 1);
        const stageOpacity = tailProgress > 0 ? 1 - tailProgress : mix(0.9, 1, entryProgress);
        const stageY = tailProgress > 0 ? mix(0, -10, tailProgress) : mix(8, 0, entryProgress);

        gsap.set(stage, { autoAlpha: stageOpacity, yPercent: stageY });

        let clipState = CLOSED;

        if (actionOffset < holdStart) {
          const progress = clamp(actionOffset / Math.max(open, 1), 0, 1);
          clipState = {
            x: mix(CLOSED.x, OPEN.x, progress),
            y: mix(CLOSED.y, OPEN.y, progress),
          };
        } else if (actionOffset < closeStart) {
          clipState = OPEN;
        } else if (actionOffset < closeEnd) {
          const progress = clamp((actionOffset - closeStart) / Math.max(close, 1), 0, 1);
          clipState = {
            x: mix(OPEN.x, CLOSED_END.x, progress),
            y: mix(OPEN.y, CLOSED_END.y, progress),
          };
        } else {
          clipState = CLOSED_END;
        }

        const clipPath = ellipse(clipState);
        gsap.set(media, { clipPath, webkitClipPath: clipPath });

        const textInStart = open * 0.24;
        const textInEnd = open * 0.62;
        const textOutStart = open + hold * 0.46;
        const textOutEnd = open + hold * 0.8;

        let autoAlpha = 0;
        let scale = 0.92;
        let y = 28;

        if (actionOffset >= textInStart && actionOffset < textInEnd) {
          const progress = clamp((actionOffset - textInStart) / Math.max(textInEnd - textInStart, 1), 0, 1);
          autoAlpha = progress;
          scale = mix(0.92, 1.04, progress);
          y = mix(28, 0, progress);
        } else if (actionOffset >= textInEnd && actionOffset < textOutStart) {
          autoAlpha = 1;
          scale = 1.04;
          y = 0;
        } else if (actionOffset >= textOutStart && actionOffset < textOutEnd) {
          const progress = clamp((actionOffset - textOutStart) / Math.max(textOutEnd - textOutStart, 1), 0, 1);
          autoAlpha = 1 - progress;
          scale = mix(1.04, 1.18, progress);
          y = mix(0, -74, progress);
        }

        gsap.set(text, { autoAlpha, scale, y });
      };

      const measure = () => {
        const vh = window.innerHeight;
        entry = Math.round((vh * entryVh) / 100);
        open = Math.round((vh * openVh) / 100);
        hold = Math.round((vh * holdVh) / 100);
        close = Math.round((vh * closeVh) / 100);
        tail = Math.round((vh * tailVh) / 100);
        total = entry + open + hold + close + tail;
        section.style.height = `${vh + total}px`;
      };

      measure();
      applyState(0);

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${Math.max(total, 1)}`,
        invalidateOnRefresh: true,
        onEnter: () => {
          video?.play?.().catch(() => {});
        },
        onEnterBack: () => {
          video?.play?.().catch(() => {});
        },
        onRefreshInit: measure,
        onRefresh: (self) => {
          applyState(self.progress * total);
        },
        onUpdate: (self) => {
          if (self.isActive) {
            video?.play?.().catch(() => {});
          }
          applyState(self.progress * total);
        },
      });

      const onResize = () => {
        trigger.refresh();
      };

      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        trigger.kill();
        section.style.removeProperty("height");
        gsap.set(stage, { clearProps: "opacity,transform" });
      };
    }, section);

    return () => ctx.revert();
  }, [closeVh, entryVh, holdVh, openVh, reduced, tailVh]);

  return (
    <section id={id} ref={sectionRef} className="video-curtain" aria-label={title}>
      <div className="video-curtain-stage" ref={stageRef}>
        <div className="video-curtain-shell">
          <div className="video-curtain-clip" ref={mediaRef}>
            <video
              ref={videoRef}
              src={src}
              autoPlay
              loop
              muted
              playsInline
              preload={preload}
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
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
