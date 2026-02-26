import { animate, createTimeline } from "animejs";

export function makeIntro({ orb, ui }) {
  const { group, innerMat, shell } = orb;
  const { headline, kicker, subhead, ctaRow, cards } = ui;

  // Initial states for dramatic entry
  group.scale.set(0, 0, 0);
  if (shell) shell.material.opacity = 0;
  
  const tl = createTimeline({ autoplay: false });

  // 1. Core Burst
  tl.add(
    {
      targets: group.scale,
      x: 1,
      y: 1,
      z: 1,
      duration: 1200,
      easing: "easeOutElastic(1, .6)",
    },
    0
  );

  tl.add(
    {
      targets: innerMat,
      emissiveIntensity: [0, 4, 2],
      duration: 1000,
      easing: "easeOutQuad",
    },
    200
  );

  // 2. HUD Reveal
  tl.add(
    {
      targets: kicker,
      opacity: [0, 1],
      translateX: [-20, 0],
      duration: 600,
      easing: "easeOutExpo",
    },
    400
  );

  // 3. Glitch Headline
  tl.add(
    {
      targets: headline,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      easing: "easeOutExpo",
      begin: () => {
        animate(headline, {
          skewX: [20, -20, 0],
          opacity: [0.5, 1, 0.8, 1],
          duration: 400,
          loop: 2,
        });
      },
    },
    500
  );

  tl.add(
    {
      targets: subhead,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 600,
      easing: "easeOutExpo",
    },
    700
  );

  tl.add(
    {
      targets: ctaRow,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 600,
      easing: "easeOutExpo",
    },
    850
  );

  return tl;
}
