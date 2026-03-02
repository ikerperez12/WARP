import { animate as animeAnimate } from "animejs-v4";

function runAnimate(target, config, animateFn) {
  if (typeof animateFn === "function") {
    return animateFn(target, config);
  }

  const normalizedConfig = { ...config };
  if (normalizedConfig.ease && !normalizedConfig.easing) {
    normalizedConfig.easing = normalizedConfig.ease;
    delete normalizedConfig.ease;
  }
  return animeAnimate(target, normalizedConfig);
}

/**
 * Binds mouse/pointer movement to the orb's rotation for a parallax effect.
 * @param {Object} options
 * @param {Object} options.orb - The orb object containing the group to rotate.
 * @param {Object} options.state - The global state object to update pointer coordinates.
 * @param {Function} [options.animate] - Optional dependency injection for tests.
 * @returns {Function} A cleanup function to remove event listeners.
 */
export function bindPointerParallax({ orb, state, animate } = {}) {
  const { group } = orb;

  function onMove(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    state.pointerX = x;
    state.pointerY = y;
  }

  window.addEventListener("pointermove", onMove);

  runAnimate(
    state,
    {
      t: 1,
      duration: 999999,
      loop: true,
      easing: "linear",
      onUpdate: () => {
        const tx = -state.pointerY * 0.18;
        const ty = state.pointerX * 0.28;

        group.rotation.x += (tx - group.rotation.x) * 0.05;
        group.rotation.y += (ty - group.rotation.y) * 0.05;
      },
    },
    animate
  );

  return () => window.removeEventListener("pointermove", onMove);
}

/**
 * Initializes mouse-tracking for a radial spotlight effect on UI cards.
 * @param {HTMLElement[]} cards - An array of card elements to bind the effect to.
 */
export function bindCardHover(cards) {
  cards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
    });
  });
}

/**
 * Triggers a visual 'burst' animation on the orb.
 * Supports both signatures:
 * - burst({ orb, state, animate })
 * - burst({ orb, state }, animateFn)
 * @param {Object} options
 * @param {Object} options.orb - The orb object.
 * @param {Object} options.state - The state object.
 * @param {Function} [options.animate] - Optional dependency injection for tests.
 * @param {Function} [animateOverride] - Optional second-argument injector.
 */
export function burst({ orb, state, animate } = {}, animateOverride) {
  const injectedAnimate = animateOverride || animate;
  const { ringMat, coreMat, group } = orb;

  runAnimate(
    ringMat,
    {
      opacity: [0.45, 0.95],
      duration: 180,
      direction: "alternate",
      easing: "easeOutCubic",
    },
    injectedAnimate
  );

  runAnimate(
    group.position,
    {
      z: [0, 0.25],
      duration: 220,
      direction: "alternate",
      easing: "easeOutCubic",
    },
    injectedAnimate
  );

  runAnimate(
    coreMat.emissive,
    {
      r: [0.07, 0.22],
      g: [0.07, 0.22],
      b: [0.07, 0.22],
      duration: 220,
      direction: "alternate",
      easing: "easeOutCubic",
    },
    injectedAnimate
  );

  runAnimate(
    state,
    {
      shake: [0, 1],
      duration: 260,
      direction: "alternate",
      easing: "easeOutCubic",
      onUpdate: () => {
        group.rotation.z = (Math.random() - 0.5) * 0.08 * state.shake;
      },
      onComplete: () => {
        group.rotation.z = 0;
      },
    },
    injectedAnimate
  );
}
