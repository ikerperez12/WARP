import { animate } from "animejs-v4";

export function startLoops({ orb, state }) {
  const { group, shards, points, ptsMat } = orb;

  animate(group.rotation, {
    y: "+=6.283185",
    duration: 30000,
    loop: true,
    easing: "linear",
  });

  if (shards) {
    animate(shards.rotation, {
      y: "-=6.283185",
      x: "+=3.14",
      duration: 20000,
      loop: true,
      easing: "linear",
    });
  }

  animate(state, {
    breath: [0, 1],
    duration: 3000,
    direction: "alternate",
    loop: true,
    easing: "easeInOutQuad",
    onUpdate: () => {
      const s = 1 + state.breath * 0.05;
      group.scale.set(s, s, s);
    },
  });

  animate(ptsMat, {
    opacity: [0.2, 0.6],
    duration: 2000,
    direction: "alternate",
    loop: true,
    easing: "easeInOutQuad",
  });

  return { group, points };
}
