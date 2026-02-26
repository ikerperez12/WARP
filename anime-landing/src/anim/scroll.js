import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function bindScrollEffects({ orb, ui, state, onScrollProgress }) {
  const { group, innerCore, shell, shards } = orb;

  // 1. Sync 3D Core with Scroll
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        state.scroll = self.progress;
        if (onScrollProgress) onScrollProgress(self.progress);
      }
    }
  });

  tl.to(group.position, { z: -2, ease: "none" }, 0)
    .to(group.rotation, { y: Math.PI * 2, ease: "none" }, 0);

  // 2. Section Based Transitions
  // Features Section
  gsap.to(group.position, {
    x: 3,
    scrollTrigger: {
      trigger: "#features",
      start: "top bottom",
      end: "top center",
      scrub: 1,
    }
  });

  gsap.to(shell.scale, {
    x: 1.5, y: 1.5, z: 1.5,
    scrollTrigger: {
      trigger: "#features",
      start: "top center",
      end: "bottom center",
      scrub: 1,
    }
  });

  // Docs Section
  gsap.to(group.position, {
    x: -3,
    scrollTrigger: {
      trigger: "#docs",
      start: "top bottom",
      end: "top center",
      scrub: 1,
    }
  });

  // 3. UI Reveals
  const sections = gsap.utils.toArray(".section");
  sections.forEach(section => {
    const h2 = section.querySelector("h2");
    const p = section.querySelector("p");
    
    gsap.from(h2, {
      opacity: 0,
      x: -50,
      skewX: 20,
      duration: 1,
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
      }
    });

    gsap.from(p, {
      opacity: 0,
      y: 20,
      duration: 1,
      delay: 0.2,
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
      }
    });
  });

  // Cards reveal
  gsap.from(".card", {
    opacity: 0,
    y: 50,
    stagger: 0.1,
    duration: 0.8,
    ease: "back.out(1.7)",
    scrollTrigger: {
      trigger: "#cards",
      start: "top 90%",
    }
  });

  return () => {
    ScrollTrigger.getAll().forEach(t => t.kill());
  };
}
