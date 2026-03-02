import { animate } from "animejs-v4";

export function setupSvgDemo() {
  const path = document.querySelector("#demoPath");
  const dot = document.querySelector("#demoDot");

  if (!path || !dot) return;

  const length = path.getTotalLength();
  path.style.strokeDasharray = `${length}`;
  path.style.strokeDashoffset = `${length}`;

  function reset() {
    path.style.strokeDashoffset = `${length}`;
    dot.setAttribute("cx", "30");
    dot.setAttribute("cy", "120");
  }

  function draw() {
    animate(path.style, {
      strokeDashoffset: [length, 0],
      duration: 900,
      easing: "easeOutCubic",
    });
  }

  function moveDot() {
    const s = { t: 0 };
    animate(s, {
      t: 1,
      duration: 1200,
      easing: "easeInOutCubic",
      onUpdate: () => {
        const p = path.getPointAtLength(s.t * length);
        dot.setAttribute("cx", String(p.x));
        dot.setAttribute("cy", String(p.y));
      },
    });
  }

  document.querySelector("#btnSvgDraw")?.addEventListener("click", draw);
  document.querySelector("#btnSvgMove")?.addEventListener("click", moveDot);
  document.querySelector("#btnSvgReset")?.addEventListener("click", reset);

  return { reset, draw, moveDot };
}
