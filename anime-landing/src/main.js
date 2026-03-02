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
import { initPrefs, updatePrefs } from "./preferences.js";

gsap.registerPlugin(ScrollTrigger);

const prefs = initPrefs({ theme: "dark", lang: "es" });

const copy = {
  es: {
    nav: ["Sistemas", "Protocolos", "Neural", "Experiencia gaming"],
    theme: { dark: "Modo claro", light: "Modo oscuro" },
    lang: "ES / EN",
    kicker: "Acelerando el descubrimiento matemático y científico",
    headline: "The Visionary<br />Collective",
    subhead:
      "Desplegando motores neuronales de alto rendimiento para la próxima generación de avances científicos. Impulsado por Three.js, postprocesado y motion narrative con GSAP.",
    ctas: ["Inicializar núcleo", "Burst neuronal"],
    stats: ["FPS de sincronía", "Profundidad del núcleo"],
    sections: {
      featuresTitle: "Arquitectura del sistema",
      featuresBody:
        "Orquestación de entornos 3D complejos con latencia submilisegundo. Protocolos de interacción en tiempo real habilitados por el Visionary Core.",
      docsTitle: "Demos de protocolo",
      docsBody: "Ejecuta abajo demos SVG de trazado y sincronización de rutas.",
    },
    demoButtons: ["Dibujar ruta", "Sincronizar datos", "Purgar"],
    footer: "// TERMINAL_SESSION_SECURE // © 2026 WARP COLLECTIVE",
  },
  en: {
    nav: ["Systems", "Protocols", "Neural", "Gaming experience"],
    theme: { dark: "Light mode", light: "Dark mode" },
    lang: "EN / ES",
    kicker: "Accelerating mathematical and scientific discovery",
    headline: "The Visionary<br />Collective",
    subhead:
      "Deploying high-performance neural engines for the next generation of scientific breakthroughs. Powered by Three.js post-processing and GSAP narrative motion.",
    ctas: ["Initialize core", "Neural burst"],
    stats: ["Neural sync FPS", "Core depth"],
    sections: {
      featuresTitle: "System architecture",
      featuresBody:
        "Orchestrating complex 3D environments with sub-millisecond latency. Real-time interaction protocols enabled by the Visionary Core.",
      docsTitle: "Protocol demos",
      docsBody: "Run low-level SVG drawing and path synchronization demos below.",
    },
    demoButtons: ["Draw path", "Sync data", "Purge"],
    footer: "// TERMINAL_SESSION_SECURE // © 2026 WARP COLLECTIVE",
  },
};

function getCopy() {
  return copy[document.documentElement.lang === "en" ? "en" : "es"];
}

function applyLanguage() {
  const text = getCopy();
  const navLinks = $all(".nav a");
  navLinks.forEach((node, index) => {
    if (node) node.textContent = text.nav[index] || node.textContent;
  });

  if ($("#btnTheme")) $("#btnTheme").textContent = text.theme[prefs.theme];
  if ($("#btnLang")) $("#btnLang").textContent = text.lang;
  if ($(".kicker")) $(".kicker").textContent = text.kicker;
  if ($(".headline")) $(".headline").innerHTML = text.headline;
  if ($(".subhead")) $(".subhead").textContent = text.subhead;

  const ctaButtons = [$("#btnPlay"), $("#btnBurst")];
  ctaButtons.forEach((node, index) => {
    if (node) node.textContent = text.ctas[index] || node.textContent;
  });

  const statLabels = $all(".stat-label");
  statLabels.forEach((node, index) => {
    if (node) node.textContent = text.stats[index] || node.textContent;
  });

  if ($("#features h2")) $("#features h2").textContent = text.sections.featuresTitle;
  if ($("#features p")) $("#features p").textContent = text.sections.featuresBody;
  if ($("#docs h2")) $("#docs h2").textContent = text.sections.docsTitle;
  if ($("#docs > p")) $("#docs > p").textContent = text.sections.docsBody;

  const demoButtons = [$("#btnSvgDraw"), $("#btnSvgMove"), $("#btnSvgReset")];
  demoButtons.forEach((node, index) => {
    if (node) node.textContent = text.demoButtons[index] || node.textContent;
  });

  if ($(".footer div")) $(".footer div").textContent = text.footer;
  mountCards($("#cards"), prefs.lang);
  ui.cards = $all(".card");
  bindCardHover(ui.cards);
}

function syncThemeLabels() {
  const text = getCopy();
  if ($("#btnTheme")) $("#btnTheme").textContent = text.theme[prefs.theme];
  document.body.dataset.theme = prefs.theme;
}

const lenis = new Lenis();
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

const canvas = document.querySelector("#bg");
const { renderer, scene, camera, composer } = createScene(canvas);
bindResize(renderer, camera, composer);

const orb = addOrb(scene);

mountCards($("#cards"), prefs.lang);

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
  onScrollProgress: (progress) => {
    ui.statScroll.textContent = `${Math.round(progress * 100)}%`;
  },
});

setupSvgDemo();
applyLanguage();
syncThemeLabels();

$("#btnPlay")?.addEventListener("click", () => {
  introTL.restart();
});

$("#btnBurst")?.addEventListener("click", () => {
  burst({ orb, state });
});

$("#btnTheme")?.addEventListener("click", () => {
  prefs.theme = prefs.theme === "dark" ? "light" : "dark";
  updatePrefs({ theme: prefs.theme });
  syncThemeLabels();
});

$("#btnLang")?.addEventListener("click", () => {
  prefs.lang = prefs.lang === "es" ? "en" : "es";
  updatePrefs({ lang: prefs.lang });
  applyLanguage();
  syncThemeLabels();
});

window.addEventListener("warp:anime-prefs-changed", (event) => {
  if (event.detail?.theme) prefs.theme = event.detail.theme;
  if (event.detail?.lang) prefs.lang = event.detail.lang;
  applyLanguage();
  syncThemeLabels();
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
