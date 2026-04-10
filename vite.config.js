import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        main: 'index.html',
        experience: 'experience.html',
      },
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('three/examples/jsm/postprocessing')) return 'three-postfx';
          if (id.includes('three/examples/jsm/loaders') || id.includes('three/examples/jsm/utils')) return 'three-io';
          if (id.includes('three/examples/jsm')) return 'three-extras';
          if (id.includes('three')) return 'three-core';
          if (id.includes('gsap')) return 'gsap-vendor';
        },
      },
    },
  },
});
