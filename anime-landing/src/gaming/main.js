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

// Setup HTML elements
const canvas = document.querySelector('#game-canvas');
const loadingScreen = document.querySelector('#loading');
const speedUI = document.querySelector('#speed');
const fpsUI = document.querySelector('#fps');

// 1. Core Visual Setup (Ultra Modern)
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202);
scene.fog = new THREE.FogExp2(0x020202, 0.015);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);

// Post Processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// High-end Bloom
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // intensity
    0.4, // radius
    0.85 // threshold
);
composer.addPass(bloomPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

// 2. Physics & Game Logic Setup
const physics = new PhysicsWorld();
const environment = new Environment(scene, physics.world);
const vehicle = new Vehicle(scene, physics.world);
const controls = new Controls();
const cameraFollow = new CameraFollow(camera, vehicle.mesh);

// 3. Lighting (Dramatic & Cinematic)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xaaccff, 2.5);
dirLight.position.set(50, 60, -30);
dirLight.castShadow = true;
// High-res shadow map
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

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// Hide Loading Screen
setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => loadingScreen.remove(), 800);
}, 1000);

// 4. Main Game Loop
const clock = new THREE.Clock();
let frames = 0;
let accTime = 0;

function tick() {
    const dt = Math.min(clock.getDelta(), 0.1); // cap dt

    // Update Physics
    physics.update(dt);

    // Update Game Entities
    vehicle.update(controls.getState(), dt);
    cameraFollow.update(dt);

    // Attach point light to vehicle for cool glow effect
    pointLight.position.copy(vehicle.mesh.position).add(new THREE.Vector3(0, 1, 0));

    // Render
    composer.render();

    // Update UI Stats
    frames++;
    accTime += dt;
    if (accTime >= 0.5) {
        fpsUI.innerText = Math.round((frames / accTime));
        frames = 0;
        accTime = 0;
    }

    // Calculate speed in km/h based on physics body velocity length
    const speed = vehicle.body.velocity.length() * 3.6;
    speedUI.innerText = Math.round(speed);

    requestAnimationFrame(tick);
}

// Start loop
requestAnimationFrame(tick);
