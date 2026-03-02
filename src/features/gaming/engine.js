import * as THREE from 'three';
import { Player } from './player.js';
import { World } from './world.js';
import { Controls } from './controls.js';
import { Physics } from './physics.js';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.isActive = false;
    this.score = 0;
    this.integrity = 100;
    this.speed = 10;
    this.maxSpeed = 50;
    this.clock = new THREE.Clock();
    this.rafId = null;
  }

  async init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050508);
    this.scene.fog = new THREE.FogExp2(0x050508, 0.05);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 5);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x00f2ff, 1);
    mainLight.position.set(5, 5, 5);
    this.scene.add(mainLight);

    // Modules
    this.controls = new Controls();
    this.player = new Player(this.scene);
    this.world = new World(this.scene);
    this.physics = new Physics();

    window.addEventListener('resize', () => this.onResize());
  }

  start() {
    this.isActive = true;
    this.clock.start();
    this.animate();
  }

  stop() {
    this.isActive = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  reset() {
    this.score = 0;
    this.integrity = 100;
    this.speed = 10;
    this.player.reset();
    this.world.reset();
    this.updateHUD();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  updateHUD() {
    window.dispatchEvent(new CustomEvent('game:update-hud', {
      detail: {
        score: Math.floor(this.score),
        integrity: this.integrity,
        speed: this.speed
      }
    }));
  }

  animate() {
    if (!this.isActive) return;
    this.rafId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Increase speed gradually
    if (this.speed < this.maxSpeed) {
      this.speed += delta * 0.2;
    }

    // Update modules
    this.player.update(delta, this.controls);
    this.world.update(delta, this.speed);
    
    // Check collisions
    const collisions = this.physics.checkCollisions(this.player, this.world.getObstacles());
    
    if (collisions.hit) {
      this.handleHit(collisions.type);
    }

    // Scoring
    this.score += delta * this.speed;
    this.updateHUD();

    // Camera follow (slight lag for smoothness)
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, this.player.mesh.position.x * 0.5, 0.1);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 2 + this.player.mesh.position.y * 0.5, 0.1);
    this.camera.lookAt(this.player.mesh.position.x * 0.2, 0, -10);

    this.renderer.render(this.scene, this.camera);
  }

  handleHit(type) {
    if (type === 'obstacle') {
      this.integrity -= 20;
      this.speed *= 0.7; // Slow down on hit
      
      if (this.integrity <= 0) {
        this.integrity = 0;
        this.gameOver();
      }
    } else if (type === 'key') {
      this.score += 500;
      this.integrity = Math.min(100, this.integrity + 5);
    }
    this.updateHUD();
  }

  gameOver() {
    this.isActive = false;
    window.dispatchEvent(new CustomEvent('game:over', {
      detail: { score: Math.floor(this.score) }
    }));
  }
}
