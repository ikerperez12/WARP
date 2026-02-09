import "./style.css";

import { createScene } from "./three/scene.js";
import { bindResize } from "./three/resize.js";
import { addOrb } from "./three/objects.js";
import { startRenderLoop } from "./three/render.js";

import { mountCards } from "./ui/cards.js";
import { $, $all } from "./ui/dom.js";

import { makeIntro } from "./anim/intro.js";
import { startLoops } from "./anim/loop.js";
import { bindPointerParallax, burst } from "./anim/interactions.js";
import { bindScrollEffects } from "./anim/scroll.js";

import { setupSvgDemo } from "./demos/svgDemo.js";

const canvas = document.querySelector("#bg");
const { renderer, scene, camera } = createScene(canvas);
bindResize(renderer, camera);

const orb = addOrb(scene);

const cardsWrap = $("#cards");
mountCards(cardsWrap);

const ui = {
  kicker: $(".kicker"),
  headline: $(".headline"),
  subhead: $(".subhead"),
  ctaRow: $(".cta-row"),
  cards: $all(".card"),
  statFps: $("#statFps"),
  statScroll: $("#statScroll"),
};

const state = {
  pointerX: 0,
  pointerY: 0,
  scroll: 0,
  breath: 0,
  shake: 0,
};

const introTL = makeIntro({ orb, ui });
introTL.play();

startLoops({ orb, state });

bindPointerParallax({ orb, state });

bindScrollEffects({
  orb,
  ui,
  state,
  onScrollProgress: (p) => {
    ui.statScroll.textContent = `${Math.round(p * 100)}%`;
  },
});

setupSvgDemo();

$("#btnPlay")?.addEventListener("click", () => {
  introTL.restart();
});

$("#btnBurst")?.addEventListener("click", () => {
  burst({ orb, state });
});

let theme = 0;
$("#btnTheme")?.addEventListener("click", () => {
  theme = (theme + 1) % 2;
  if (theme === 1) {
    document.documentElement.style.setProperty("--bg", "#090a10");
    document.documentElement.style.setProperty("--accent", "#7cf7ff");
  } else {
    document.documentElement.style.setProperty("--bg", "#0b0f14");
    document.documentElement.style.setProperty("--accent", "#b6ff3b");
  }
});

let acc = 0;
let frames = 0;
startRenderLoop({
  renderer,
  scene,
  camera,
  onTick: ({ dt }) => {
    acc += dt;
    frames += 1;
    if (acc >= 500) {
      const fps = Math.round((frames * 1000) / acc);
      ui.statFps.textContent = String(fps);
      acc = 0;
      frames = 0;
    }
  },
});
