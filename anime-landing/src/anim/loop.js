import { animate } from "animejs";

export function startLoops({ orb, state }) {
  const { group, ring, points, ptsMat } = orb;

  animate(group.rotation, {
    y: "+=6.283185",
    duration: 22000,
    loop: true,
    ease: "linear",
  });

  animate(ring.rotation, {
    z: "+=6.283185",
    duration: 16000,
    loop: true,
    ease: "linear",
  });

  animate(state, {
    breath: [0, 1],
    duration: 2600,
    direction: "alternate",
    loop: true,
    ease: "inOut(3)",
    onUpdate: () => {
      const s = 1 + state.breath * 0.02;
      group.scale.set(s, s, s);
    },
  });

  animate(ptsMat, {
    opacity: [0.35, 0.7],
    duration: 1800,
    direction: "alternate",
    loop: true,
    ease: "inOut(3)",
  });

  animate(group.rotation, {
    x: [-0.06, 0.06],
    duration: 4200,
    direction: "alternate",
    loop: true,
    ease: "inOut(3)",
  });

  return { group, ring, points };
}
