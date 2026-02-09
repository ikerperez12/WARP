import { animate } from "animejs";

export function bindScrollEffects({ orb, ui, state, onScrollProgress }) {
  const { group, ringMat, ptsMat } = orb;

  function clamp01(v) {
    if (v < 0) return 0;
    if (v > 1) return 1;
    return v;
  }

  function readProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? doc.scrollTop / max : 0;
    return clamp01(p);
  }

  function apply(p) {
    state.scroll = p;

    group.position.z = 0 + p * -0.5;
    ringMat.opacity = 0.45 - p * 0.15;
    ptsMat.opacity = 0.55 - p * 0.2;

    if (onScrollProgress) onScrollProgress(p);
  }

  apply(readProgress());

  let raf = 0;
  function onScroll() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => apply(readProgress()));
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  const cards = ui.cards;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((ent) => {
        if (!ent.isIntersecting) return;
        animate(ent.target, {
          opacity: [0, 1],
          translateY: [12, 0],
          duration: 520,
          ease: "out(3)",
        });
        io.unobserve(ent.target);
      });
    },
    { threshold: 0.25 }
  );
  cards.forEach((c) => io.observe(c));

  return () => {
    window.removeEventListener("scroll", onScroll);
    io.disconnect();
  };
}
