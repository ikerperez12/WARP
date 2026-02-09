import { animate } from "animejs";

export function bindPointerParallax({ orb, state }) {
  const { group } = orb;

  function onMove(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    state.pointerX = x;
    state.pointerY = y;
  }

  window.addEventListener("pointermove", onMove);

  animate(state, {
    t: 1,
    duration: 999999,
    loop: true,
    ease: "linear",
    onUpdate: () => {
      const tx = -state.pointerY * 0.18;
      const ty = state.pointerX * 0.28;

      group.rotation.x += (tx - group.rotation.x) * 0.05;
      group.rotation.y += (ty - group.rotation.y) * 0.05;
    },
  });

  return () => window.removeEventListener("pointermove", onMove);
}

export function burst({ orb, state }) {
  const { ringMat, coreMat, group } = orb;

  animate(ringMat, {
    opacity: [0.45, 0.95],
    duration: 180,
    direction: "alternate",
    ease: "out(3)",
  });

  animate(group.position, {
    z: [0, 0.25],
    duration: 220,
    direction: "alternate",
    ease: "out(3)",
  });

  animate(coreMat.emissive, {
    r: [0.07, 0.22],
    g: [0.07, 0.22],
    b: [0.07, 0.22],
    duration: 220,
    direction: "alternate",
    ease: "out(3)",
  });

  animate(state, {
    shake: [0, 1],
    duration: 260,
    direction: "alternate",
    ease: "out(3)",
    onUpdate: () => {
      group.rotation.z = (Math.random() - 0.5) * 0.08 * state.shake;
    },
    onComplete: () => {
      group.rotation.z = 0;
    },
  });
}
