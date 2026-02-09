import { createTimeline } from "animejs";

export function makeIntro({ orb, ui }) {
  const { group } = orb;
  const { headline, kicker, subhead, ctaRow, cards } = ui;

  group.scale.set(0.86, 0.86, 0.86);
  group.position.set(0, 0, -0.9);

  const tl = createTimeline({ autoplay: false });

  tl.add(group.position, { z: 0, duration: 900, ease: "out(3)" }, 0);
  tl.add(group.scale, { x: 1, y: 1, z: 1, duration: 900, ease: "out(3)" }, 0);

  tl.add(kicker, { opacity: [0, 1], translateY: [10, 0], duration: 520, ease: "out(3)" }, 120);
  tl.add(headline, { opacity: [0, 1], translateY: [18, 0], duration: 650, ease: "out(3)" }, 160);
  tl.add(subhead, { opacity: [0, 1], translateY: [14, 0], duration: 650, ease: "out(3)" }, 220);
  tl.add(ctaRow, { opacity: [0, 1], translateY: [12, 0], duration: 650, ease: "out(3)" }, 280);

  tl.add(
    cards,
    {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 520,
      delay: (_, i) => 80 * i,
      ease: "out(3)",
    },
    320
  );

  return tl;
}
