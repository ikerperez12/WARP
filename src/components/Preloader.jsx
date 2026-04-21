import { useEffect, useState } from "react";
import "./Preloader.css";

/**
 * Preloader 0-100%.
 *
 * Why it exists: the first render mounts the global 3D background, the hero,
 * and the first pinned video curtain.
 * If we show the page before everything is decoded, the scroll feels stuttery for a few
 * seconds. Giving the browser a quiet moment to preload assets pays off in fluidity.
 *
 * Strategy: listen to drei's `useProgress` for GLB/texture loading AND track the
 * first curtain video, then fade out when both are done or
 * after a hard timeout (5s) so the user never gets stuck on a 99% bar.
 */
export default function Preloader({ children }) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let raf;
    let assetProgress = 0;
    let videoProgress = 0;

    // 1. Lazy-load useProgress only if drei is available
    let unsubscribe = () => {};
    (async () => {
      try {
        const drei = await import("@react-three/drei");
        unsubscribe = drei.useProgress.subscribe((state) => {
          assetProgress = state.progress; // 0-100
        });
      } catch {
        // drei not ready yet — fallback to timeout
        assetProgress = 100;
      }
    })();

    // 2. Track video load
    const videos = ["/assets/videos/creative-vision-1080p.mp4"];
    let loaded = 0;
    videos.forEach((src) => {
      const v = document.createElement("video");
      v.preload = "auto";
      v.src = src;
      v.muted = true;
      v.addEventListener("canplaythrough", () => {
        loaded++;
        videoProgress = (loaded / videos.length) * 100;
      }, { once: true });
      v.addEventListener("error", () => {
        loaded++;
        videoProgress = (loaded / videos.length) * 100;
      }, { once: true });
    });

    // 3. Combined progress tick + hard timeout
    const start = performance.now();
    const HARD_TIMEOUT = 3200;

    const loop = () => {
      const elapsed = performance.now() - start;
      // 70% weight to assets, 30% to videos
      const combined = Math.min(100, Math.round(assetProgress * 0.7 + videoProgress * 0.3));
      setProgress(combined);
      if (combined >= 99 || elapsed > HARD_TIMEOUT) {
        setProgress(100);
        setReady(true);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => setHidden(true), 450);
    return () => clearTimeout(id);
  }, [ready]);

  useEffect(() => {
    // Block scroll while overlay is up
    if (!hidden) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [hidden]);

  return (
    <>
      {children}
      {!hidden && (
        <div
          className={`preloader ${ready ? "is-ready" : ""}`}
          role="status"
          aria-live="polite"
          aria-label={`Cargando ${progress}%`}
        >
          <div className="preloader-center">
            <div className="preloader-brand">
              <span className="preloader-bracket">&lt;</span>
              <span className="preloader-initials">IP</span>
              <span className="preloader-bracket">/&gt;</span>
            </div>

            <div className="preloader-track">
              <div
                className="preloader-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="preloader-meta">
              <span className="preloader-label">LOADING</span>
              <span className="preloader-pct">{progress}%</span>
            </div>
          </div>

          <div className="preloader-corner preloader-tl" />
          <div className="preloader-corner preloader-tr" />
          <div className="preloader-corner preloader-bl" />
          <div className="preloader-corner preloader-br" />
        </div>
      )}
    </>
  );
}
