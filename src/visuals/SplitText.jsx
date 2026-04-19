import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "../lib/useReducedMotion.js";

export default function SplitText({ children, delay = 0, stagger = 0.03, as = "span", className = "" }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const text = typeof children === "string" ? children : "";
  const Tag = as;

  useEffect(() => {
    if (reduced || !ref.current) return;
    const chars = ref.current.querySelectorAll(".split-char");
    gsap.fromTo(
      chars,
      { opacity: 0, y: 40, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power3.out",
        stagger,
        delay,
      }
    );
  }, [text, delay, stagger, reduced]);

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag ref={ref} className={`split-text ${className}`} aria-label={text}>
      {[...text].map((ch, i) => (
        <span key={i} className="split-char" aria-hidden="true" style={{ display: "inline-block" }}>
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </Tag>
  );
}
