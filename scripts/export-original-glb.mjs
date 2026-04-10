import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

import { createLaptopModel } from '../src/three-scene.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, '..', 'modelos3D', 'original.glb');

if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    constructor() {
      this.result = null;
      this.error = null;
      this.onloadend = null;
      this.onerror = null;
    }

    async readAsArrayBuffer(blob) {
      try {
        this.result = await blob.arrayBuffer();
        if (typeof this.onloadend === 'function') this.onloadend();
      } catch (error) {
        this.error = error;
        if (typeof this.onerror === 'function') this.onerror(error);
      }
    }

    async readAsDataURL(blob) {
      try {
        const buffer = Buffer.from(await blob.arrayBuffer());
        const mime = blob.type || 'application/octet-stream';
        this.result = `data:${mime};base64,${buffer.toString('base64')}`;
        if (typeof this.onloadend === 'function') this.onloadend();
      } catch (error) {
        this.error = error;
        if (typeof this.onerror === 'function') this.onerror(error);
      }
    }
  };
}

async function exportLaptop() {
  const model = createLaptopModel({
    screen: { texture: null },
    glow: null,
  });

  model.root.name = 'warp_laptop_original';
  model.root.updateMatrixWorld(true);

  // Node export path: strip runtime texture maps to avoid DOM/canvas dependency in GLTFExporter.
  if (model.panelMat) {
    model.panelMat.map = null;
    model.panelMat.emissiveMap = null;
    model.panelMat.needsUpdate = true;
  }
  if (model.underGlowMat) {
    model.underGlowMat.map = null;
    model.underGlowMat.needsUpdate = true;
  }

  const exporter = new GLTFExporter();
  const arrayBuffer = await new Promise((resolve, reject) => {
    exporter.parse(
      model.root,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
          return;
        }
        reject(new Error('GLTFExporter did not return binary data.'));
      },
      (error) => reject(error),
      { binary: true, onlyVisible: true, maxTextureSize: 2048 }
    );
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Buffer.from(arrayBuffer));

  model.geometries.forEach((geometry) => geometry.dispose());
  model.materials.forEach((material) => material.dispose());

  console.log(`GLB exported: ${outputPath}`);
}

exportLaptop().catch((error) => {
  console.error('Failed to export original GLB:', error);
  process.exitCode = 1;
});
