import './gaming.css';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { PhysicsWorld } from './Physics.js';
import { Environment } from './Environment.js';
import { Vehicle } from './Vehicle.js';
import { Controls } from './Controls.js';
import { CameraFollow } from './CameraFollow.js';
import { initPrefs, updatePrefs } from '../preferences.js';

const prefs = initPrefs({ theme: 'dark', lang: 'es' });

const gameCopy = {
  es: {
    back: 'Salir',
    theme: { dark: 'Modo claro', light: 'Modo oscuro' },
    lang: 'ES / EN',
    speed: 'KM/H',
    instructions: '[W][A][S][D] / Flechas para moverte <br>[SPACE] para boost <br>[R] para reiniciar',
    loading: 'INICIALIZANDO FÍSICA NEURAL...',
  },
  en: {
    back: 'Exit protocol',
    theme: { dark: 'Light mode', light: 'Dark mode' },
    lang: 'EN / ES',
    speed: 'KM/H',
    instructions: '[W][A][S][D] / Arrows to navigate <br>[SPACE] to boost <br>[R] to reset',
    loading: 'INITIALIZING NEURAL PHYSICS...',
  },
};

function getCopy() {
  return gameCopy[document.documentElement.lang === 'en' ? 'en' : 'es'];
}

const canvas = document.querySelector('#game-canvas');
const loadingScreen = document.querySelector('#loading');
const loadingText = document.querySelector('#loading-text');
const speedUI = document.querySelector('#speed');
const speedLabel = document.querySelector('#speed-label');
const fpsUI = document.querySelector('#fps');
const backText = document.querySelector('#hud-back-text');
const instructions = document.querySelector('#instructions');
const themeButton = document.querySelector('#btnTheme');
const langButton = document.querySelector('#btnLang');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202);
scene.fog = new THREE.FogExp2(0x020202, 0.015);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

const physics = new PhysicsWorld();
const environment = new Environment(scene, physics.world);
const vehicle = new Vehicle(scene, physics.world);
const controls = new Controls();
const cameraFollow = new CameraFollow(camera, vehicle.mesh);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xaaccff, 2.5);
dirLight.position.set(50, 60, -30);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 10;
dirLight.shadow.camera.far = 200;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
dirLight.shadow.bias = -0.001;
scene.add(dirLight);

const pointLight = new THREE.PointLight(0x00ff41, 5, 20);
scene.add(pointLight);

function applyLanguage() {
  const copy = getCopy();
  if (backText) backText.textContent = copy.back;
  if (speedLabel) speedLabel.textContent = copy.speed;
  if (instructions) instructions.innerHTML = copy.instructions;
  if (loadingText) loadingText.innerHTML = `${copy.loading} <span id="loading-progress">0%</span>`;
  if (langButton) langButton.textContent = copy.lang;
  if (themeButton) themeButton.textContent = copy.theme[prefs.theme];
}

function applyTheme() {
  document.body.dataset.theme = prefs.theme;
  const isLight = prefs.theme === 'light';
  scene.background = new THREE.Color(isLight ? 0xe8eef3 : 0x020202);
  scene.fog.color.setHex(isLight ? 0xe8eef3 : 0x020202);
  scene.fog.density = isLight ? 0.011 : 0.015;
  renderer.toneMappingExposure = isLight ? 1.0 : 1.2;
  ambientLight.intensity = isLight ? 0.42 : 0.1;
  dirLight.color.setHex(isLight ? 0xffffff : 0xaaccff);
  dirLight.intensity = isLight ? 2.1 : 2.5;
  pointLight.color.setHex(isLight ? 0x0e9f6e : 0x00ff41);
  pointLight.intensity = isLight ? 3.8 : 5;
  bloomPass.strength = isLight ? 0.9 : 1.5;
  environment.setTheme(prefs.theme);
  vehicle.setTheme(prefs.theme);
  if (themeButton) themeButton.textContent = getCopy().theme[prefs.theme];
}

applyLanguage();
applyTheme();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

themeButton?.addEventListener('click', () => {
  prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
  updatePrefs({ theme: prefs.theme });
  applyTheme();
  applyLanguage();
});

langButton?.addEventListener('click', () => {
  prefs.lang = prefs.lang === 'es' ? 'en' : 'es';
  updatePrefs({ lang: prefs.lang });
  applyLanguage();
});

window.addEventListener('warp:anime-prefs-changed', (event) => {
  if (event.detail?.theme) prefs.theme = event.detail.theme;
  if (event.detail?.lang) prefs.lang = event.detail.lang;
  applyTheme();
  applyLanguage();
});

setTimeout(() => {
  loadingScreen.style.opacity = '0';
  setTimeout(() => loadingScreen.remove(), 800);
}, 1000);

const clock = new THREE.Clock();
let frames = 0;
let accTime = 0;

function tick() {
  const dt = Math.min(clock.getDelta(), 0.1);

  physics.update(dt);
  vehicle.update(controls.getState(), dt);
  cameraFollow.update(dt);
  pointLight.position.copy(vehicle.mesh.position).add(new THREE.Vector3(0, 1, 0));
  composer.render();

  frames += 1;
  accTime += dt;
  if (accTime >= 0.5) {
    fpsUI.innerText = Math.round(frames / accTime);
    frames = 0;
    accTime = 0;
  }

  const speed = vehicle.body.velocity.length() * 3.6;
  speedUI.innerText = Math.round(speed);

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
