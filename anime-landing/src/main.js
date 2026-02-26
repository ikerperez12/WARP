import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

import { createScene } from "./three/scene.js";
import { bindResize } from "./three/resize.js";
import { addOrb } from "./three/objects.js";
import { startRenderLoop } from "./three/render.js";

import { mountCards } from "./ui/cards.js";
import { $, $all } from "./ui/dom.js";

import { makeIntro } from "./anim/intro.js";
import { startLoops } from "./anim/loop.js";
import { bindPointerParallax, burst, bindCardHover } from "./anim/interactions.js";
import { bindScrollEffects } from "./anim/scroll.js";

import { setupSvgDemo } from "./demos/svgDemo.js";

gsap.registerPlugin(ScrollTrigger);

// 1. Smooth Scroll (Lenis)
const lenis = new Lenis();
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Scene Setup
const canvas = document.querySelector("#bg");
const { renderer, scene, camera, composer } = createScene(canvas);
bindResize(renderer, camera, composer);

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
bindCardHover(ui.cards);

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

let theme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", theme);

$("#btnTheme")?.addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
});

let acc = 0;
let frames = 0;
startRenderLoop({
  renderer,
  scene,
  camera,
  composer,
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
