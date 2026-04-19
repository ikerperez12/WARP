import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    target: "es2022",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return;
          if (id.includes("three") || id.includes("@react-three") || id.includes("postprocessing")) return "three";
          if (id.includes("gsap")) return "gsap";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("@studio-freight/lenis")) return "lenis";
        },
      },
    },
  },
  assetsInclude: ["**/*.glb", "**/*.hdr", "**/*.exr"],
});
