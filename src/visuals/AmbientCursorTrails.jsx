import { useEffect, useRef } from "react";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./AmbientCursorTrails.css";

const POINTS = 24;

export default function AmbientCursorTrails() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) return;

    const container = ref.current;
    const trail = Array.from(container.children);
    const coords = Array.from({ length: POINTS }, () => ({ x: -100, y: -100 }));
    let mouseX = -100;
    let mouseY = -100;
    let raf;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const loop = () => {
      let x = mouseX;
      let y = mouseY;
      coords.forEach((c, i) => {
        const prev = i === 0 ? { x: mouseX, y: mouseY } : coords[i - 1];
        c.x += (prev.x - c.x) * 0.45;
        c.y += (prev.y - c.y) * 0.45;
        const dot = trail[i];
        dot.style.transform = `translate(${c.x}px, ${c.y}px) scale(${1 - i / POINTS})`;
        dot.style.opacity = `${1 - i / POINTS}`;
      });
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div className="cursor-trails" ref={ref} aria-hidden="true">
      {Array.from({ length: POINTS }).map((_, i) => (
        <span key={i} className="cursor-trail-dot" />
      ))}
    </div>
  );
}
