import * as THREE from 'three';

const BLOOM_ENABLE_THRESHOLD = 0.36;

function createPresentationShader() {
  return {
    uniforms: {
      tDiffuse: { value: null },
      uVignetteStrength: { value: 0.2 },
      uScanlineStrength: { value: 0.04 },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uVignetteStrength;
      uniform float uScanlineStrength;
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        vec2 centered = vUv * 2.0 - 1.0;
        float vignette = 1.0 - dot(centered, centered) * uVignetteStrength;
        float scanline = sin((vUv.y + uTime * 0.015) * 900.0) * uScanlineStrength;
        color.rgb *= clamp(vignette + scanline, 0.0, 1.15);
        gl_FragColor = color;
      }
    `,
  };
}

export function resolvePostFXProfile(theme = 'dark', preset = null) {
  const bloomLevel = preset?.bloom ?? (theme === 'light' ? 0.4 : 0.5);
  const enableComposer = bloomLevel > BLOOM_ENABLE_THRESHOLD;

  return {
    enableComposer,
    toneMappingExposure: theme === 'light' ? 1.02 : 1.17,
    bloomStrength: theme === 'light'
      ? 0.1 + bloomLevel * 0.14
      : 0.18 + bloomLevel * 0.26,
    bloomRadius: theme === 'light' ? 0.3 : 0.46,
    bloomThreshold: theme === 'light' ? 0.82 : 0.72,
    vignetteStrength: theme === 'light' ? 0.028 + bloomLevel * 0.03 : 0.08 + bloomLevel * 0.06,
    scanlineStrength: theme === 'light' ? 0.0 : 0.003 + bloomLevel * 0.003,
  };
}

async function loadComposerModules() {
  const [
    { EffectComposer },
    { RenderPass },
    { UnrealBloomPass },
    { OutputPass },
    { ShaderPass },
  ] = await Promise.all([
    import('three/examples/jsm/postprocessing/EffectComposer.js'),
    import('three/examples/jsm/postprocessing/RenderPass.js'),
    import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
    import('three/examples/jsm/postprocessing/OutputPass.js'),
    import('three/examples/jsm/postprocessing/ShaderPass.js'),
  ]);

  return { EffectComposer, RenderPass, UnrealBloomPass, OutputPass, ShaderPass };
}

export class PostFXSystem {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.renderPass = null;
    this.bloomPass = null;
    this.presentationPass = null;
    this.outputPass = null;
    this.composer = null;
    this.composerPromise = null;
    this.profile = resolvePostFXProfile();
    this.pendingSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.elapsed = 0;
  }

  async ensureComposer() {
    if (!this.renderer || this.composer) return this.composer;
    if (!this.composerPromise) {
      this.composerPromise = loadComposerModules()
        .then(({ EffectComposer, RenderPass, UnrealBloomPass, OutputPass, ShaderPass }) => {
          this.renderPass = new RenderPass(this.scene, this.camera);
          this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.pendingSize.width, this.pendingSize.height),
            this.profile.bloomStrength,
            this.profile.bloomRadius,
            this.profile.bloomThreshold,
          );
          this.presentationPass = new ShaderPass(createPresentationShader());
          this.outputPass = new OutputPass();
          this.composer = new EffectComposer(this.renderer);
          this.composer.addPass(this.renderPass);
          this.composer.addPass(this.bloomPass);
          this.composer.addPass(this.presentationPass);
          this.composer.addPass(this.outputPass);
          this.applyProfile();
          this.resize(this.pendingSize.width, this.pendingSize.height);
          return this.composer;
        })
        .catch((error) => {
          console.warn('[postfx] Falling back to direct renderer', error);
          this.composerPromise = null;
          return null;
        });
    }
    return this.composerPromise;
  }

  applyProfile() {
    if (!this.renderer) return;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.profile.toneMappingExposure;
    if (this.bloomPass) {
      this.bloomPass.enabled = this.profile.enableComposer;
      this.bloomPass.strength = this.profile.bloomStrength;
      this.bloomPass.radius = this.profile.bloomRadius;
      this.bloomPass.threshold = this.profile.bloomThreshold;
    }
    if (this.presentationPass) {
      this.presentationPass.enabled = this.profile.enableComposer;
      this.presentationPass.uniforms.uVignetteStrength.value = this.profile.vignetteStrength;
      this.presentationPass.uniforms.uScanlineStrength.value = this.profile.scanlineStrength;
    }
  }

  setSceneCamera(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    if (this.renderPass) {
      this.renderPass.scene = scene;
      this.renderPass.camera = camera;
    }
  }

  applyTheme(theme, preset) {
    this.profile = resolvePostFXProfile(theme, preset);
    this.applyProfile();
    if (this.profile.enableComposer) {
      void this.ensureComposer();
    }
  }

  resize(width = window.innerWidth, height = window.innerHeight) {
    this.pendingSize = { width, height };
    this.composer?.setSize(width, height);
    this.bloomPass?.setSize(width, height);
  }

  render(scene = this.scene, camera = this.camera) {
    if (scene !== this.scene || camera !== this.camera) {
      this.setSceneCamera(scene, camera);
    }

    if (!this.profile.enableComposer) {
      this.renderer?.render(this.scene, this.camera);
      return;
    }

    if (!this.composer) {
      void this.ensureComposer();
      this.renderer?.render(this.scene, this.camera);
      return;
    }

    this.elapsed += 1 / 60;
    if (this.presentationPass) {
      this.presentationPass.uniforms.uTime.value = this.elapsed;
    }
    this.composer.render();
  }
}
