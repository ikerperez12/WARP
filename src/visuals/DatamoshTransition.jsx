import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./DatamoshTransition.css";

export default function DatamoshTransition({ title = "DATAMOSH", subtitle = "GLITCH TEMPORAL DISTORTION" }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.to(".datamosh-slice", {
        x: () => gsap.utils.random(-12, 12),
        repeat: -1,
        yoyo: true,
        duration: 0.08,
        stagger: { each: 0.02, from: "random" },
        ease: "steps(2)",
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="datamosh-transition" ref={ref} aria-label={title}>
      <div className="datamosh-layers" aria-hidden="true">
        {Array.from({ length: 22 }).map((_, i) => (
          <span key={i} className="datamosh-slice" style={{ "--i": i, top: `${(i / 22) * 100}%` }}>
            <span className="datamosh-slice-content">{title}</span>
          </span>
        ))}
      </div>
      <div className="datamosh-center">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}
