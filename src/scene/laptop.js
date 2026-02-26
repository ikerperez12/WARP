import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export function createLaptopModel(textures) {
  const root = new THREE.Group();

  const materials = [];
  const geometries = [];

  const useMaterial = (material) => {
    materials.push(material);
    return material;
  };

  const useGeometry = (geometry) => {
    geometries.push(geometry);
    return geometry;
  };

  const bodyMat = useMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x182845,
      metalness: 0.86,
      roughness: 0.11,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.58,
    })
  );

  const shellMat = useMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x324d73,
      metalness: 0.72,
      roughness: 0.16,
      clearcoat: 0.72,
      clearcoatRoughness: 0.09,
      envMapIntensity: 1.3,
    })
  );

  const darkMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x060913,
      metalness: 0.32,
      roughness: 0.42,
    })
  );

  const portMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x0b1120,
      metalness: 0.25,
      roughness: 0.7,
    })
  );

  const detailMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x5f779f,
      metalness: 0.8,
      roughness: 0.14,
    })
  );

  const rubberMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x080b12,
      metalness: 0.02,
      roughness: 0.88,
    })
  );

  const ledMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0xd8ecff,
      emissive: new THREE.Color(0x57a7ff),
      emissiveIntensity: 0.96,
      metalness: 0.28,
      roughness: 0.2,
    })
  );

  const keyboardMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0xf0f5ff,
      emissive: new THREE.Color(0x1f3b6f),
      emissiveIntensity: 0.58,
      metalness: 0.24,
      roughness: 0.18,
      vertexColors: true,
    })
  );

  const bezelMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x05070d,
      metalness: 0.1,
      roughness: 0.82,
    })
  );

  const panelMat = useMaterial(
    new THREE.MeshStandardMaterial({
      map: textures.screen.texture,
      emissiveMap: textures.screen.texture,
      emissive: new THREE.Color(0x7ea8ff),
      emissiveIntensity: 0.64,
      roughness: 0.06,
      metalness: 0.14,
      envMapIntensity: 1.12,
    })
  );

  const glassMat = useMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0xd4e2ff,
      transparent: true,
      opacity: 0.13,
      transmission: 0.92,
      roughness: 0.025,
      metalness: 0,
      ior: 1.4,
      thickness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.22,
    })
  );

  const underGlowMat = useMaterial(
    new THREE.MeshBasicMaterial({
      map: textures.glow,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      color: 0x79c5ff,
    })
  );

  const trackpadMat = useMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x3d5783,
      metalness: 0.6,
      roughness: 0.14,
      clearcoat: 0.9,
      clearcoatRoughness: 0.07,
      envMapIntensity: 1.34,
    })
  );

  const logoMat = useMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0xcad9ff,
      metalness: 0.55,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.18,
    })
  );

  const accentStripMat = useMaterial(
    new THREE.MeshStandardMaterial({
      color: 0xb8deff,
      emissive: new THREE.Color(0x2c8eff),
      emissiveIntensity: 0.86,
      metalness: 0.54,
      roughness: 0.2,
    })
  );

  const palmSheenMat = useMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x9cb7e4,
      transparent: true,
      opacity: 0.13,
      roughness: 0.24,
      metalness: 0.2,
      clearcoat: 0.82,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.12,
    })
  );

  const baseBottom = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(3.44, 0.086, 2.22, 7, 0.03)), bodyMat);
  baseBottom.position.y = 0.005;
  root.add(baseBottom);

  const deck = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(3.34, 0.036, 2.14, 7, 0.024)), shellMat);
  deck.position.y = 0.068;
  root.add(deck);

  const deckBevelFront = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(3.14, 0.007, 0.018, 3, 0.004)), detailMat);
  deckBevelFront.position.set(0, 0.088, 1.06);
  root.add(deckBevelFront);

  const deckBevelLeft = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(0.018, 0.007, 1.62, 3, 0.004)), detailMat);
  deckBevelLeft.position.set(-1.66, 0.088, 0.13);
  root.add(deckBevelLeft);

  const deckBevelRight = deckBevelLeft.clone();
  deckBevelRight.position.x = 1.56;
  root.add(deckBevelRight);

  const accentFront = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(2.62, 0.004, 0.018, 3, 0.004)), accentStripMat);
  accentFront.position.set(0, 0.0915, 1.02);
  root.add(accentFront);

  const accentLeft = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(0.018, 0.004, 1.12, 3, 0.004)), accentStripMat);
  accentLeft.position.set(-1.56, 0.0915, 0.22);
  root.add(accentLeft);

  const accentRight = accentLeft.clone();
  accentRight.position.x = 1.56;
  root.add(accentRight);

  const palmSheen = new THREE.Mesh(useGeometry(new THREE.PlaneGeometry(2.9, 1.42)), palmSheenMat);
  palmSheen.rotation.x = -Math.PI * 0.5;
  palmSheen.position.set(0, 0.1034, 0.3);
  root.add(palmSheen);

  const keyboardBed = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(2.78, 0.012, 1.16, 5, 0.01)), darkMat);
  keyboardBed.position.set(0, 0.1, -0.03);
  root.add(keyboardBed);

  const keyRows = 6;
  const keyCols = 16;
  const keyCount = keyRows * keyCols;

  const keyGeometry = useGeometry(new RoundedBoxGeometry(0.108, 0.022, 0.104, 2, 0.01));
  const keys = new THREE.InstancedMesh(keyGeometry, keyboardMat, keyCount);
  const tmp = new THREE.Object3D();
  const baseColor = new THREE.Color(0x8790a8);
  const rgbColor = new THREE.Color();
  const finalColor = new THREE.Color();

  let idx = 0;
  for (let row = 0; row < keyRows; row++) {
    for (let col = 0; col < keyCols; col++) {
      const x = (col - (keyCols - 1) * 0.5) * 0.152;
      const z = (row - (keyRows - 1) * 0.5) * 0.146 - 0.14;

      tmp.position.set(x, 0.112, z);
      tmp.rotation.set(0, 0, 0);
      tmp.updateMatrix();
      keys.setMatrixAt(idx, tmp.matrix);

      const hue = 0.72 + (col / (keyCols - 1)) * 0.22 + Math.sin(row * 1.2 + col * 0.45) * 0.01;
      rgbColor.setHSL(hue, 0.62, 0.55);
      finalColor.copy(baseColor).lerp(rgbColor, 0.5);
      keys.setColorAt(idx, finalColor);
      idx += 1;
    }
  }

  keys.instanceMatrix.needsUpdate = true;
  if (keys.instanceColor) keys.instanceColor.needsUpdate = true;
  root.add(keys);

  const touchpad = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(0.86, 0.009, 0.62, 4, 0.02)), trackpadMat);
  touchpad.position.set(0, 0.095, 0.68);
  root.add(touchpad);

  const touchpadEdge = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(0.74, 0.002, 0.5, 3, 0.012)), detailMat);
  touchpadEdge.position.set(0, 0.1015, 0.68);
  root.add(touchpadEdge);

  const frontLed = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(2.55, 0.014, 0.022, 4, 0.01)), ledMat);
  frontLed.position.set(0, 0.018, 1.12);
  root.add(frontLed);

  const leftPortA = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.016, 0.028, 0.24)), portMat);
  leftPortA.position.set(-1.712, 0.032, 0.32);
  root.add(leftPortA);
  const leftUsbC = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.012, 0.008, 0.08)), portMat);
  leftUsbC.position.set(-1.71, 0.026, 0.06);
  root.add(leftUsbC);
  const leftPortB = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.012, 0.018, 0.12)), portMat);
  leftPortB.position.set(-1.712, 0.032, -0.02);
  root.add(leftPortB);
  const leftAudio = new THREE.Mesh(useGeometry(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 14)), portMat);
  leftAudio.rotation.z = Math.PI * 0.5;
  leftAudio.position.set(-1.708, 0.032, -0.36);
  root.add(leftAudio);

  const leftHdmi = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.018, 0.022, 0.34)), portMat);
  leftHdmi.position.set(-1.712, 0.031, -0.26);
  root.add(leftHdmi);

  const leftRjTop = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.014, 0.012, 0.2)), portMat);
  leftRjTop.position.set(-1.713, 0.041, 0.58);
  root.add(leftRjTop);
  const leftRjBase = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.018, 0.018, 0.2)), portMat);
  leftRjBase.position.set(-1.712, 0.026, 0.58);
  root.add(leftRjBase);

  const rightPortA = leftPortB.clone();
  rightPortA.position.set(1.712, 0.032, 0.3);
  root.add(rightPortA);
  const rightUsbC = leftUsbC.clone();
  rightUsbC.position.set(1.71, 0.026, 0.02);
  root.add(rightUsbC);
  const rightPortB = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.016, 0.028, 0.24)), portMat);
  rightPortB.position.set(1.712, 0.031, -0.06);
  root.add(rightPortB);

  const rightSd = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.01, 0.006, 0.2)), portMat);
  rightSd.position.set(1.711, 0.02, -0.42);
  root.add(rightSd);

  const rightHdmi = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(0.018, 0.022, 0.34)), portMat);
  rightHdmi.position.set(1.712, 0.031, 0.1);
  root.add(rightHdmi);

  const rearVentFrame = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(2.98, 0.02, 0.24, 4, 0.01)), darkMat);
  rearVentFrame.position.set(0, 0.094, -0.98);
  root.add(rearVentFrame);

  const rearSlots = new THREE.InstancedMesh(useGeometry(new THREE.BoxGeometry(0.05, 0.009, 0.154)), portMat, 46);
  for (let i = 0; i < 46; i++) {
    const x = (i - 22.5) * 0.061;
    tmp.position.set(x, 0.101, -0.985);
    tmp.rotation.set(0, 0, 0);
    tmp.updateMatrix();
    rearSlots.setMatrixAt(i, tmp.matrix);
  }
  rearSlots.instanceMatrix.needsUpdate = true;
  root.add(rearSlots);

  // Top rear ventilation areas with slot pattern (more realistic than visible fan props)
  const topVentPanelGeo = useGeometry(new RoundedBoxGeometry(0.78, 0.01, 0.34, 4, 0.01));
  const topVentLeft = new THREE.Mesh(topVentPanelGeo, darkMat);
  topVentLeft.position.set(-0.69, 0.106, -0.66);
  root.add(topVentLeft);
  const topVentRight = topVentLeft.clone();
  topVentRight.position.x = 0.69;
  root.add(topVentRight);

  const topVentSlotGeo = useGeometry(new THREE.BoxGeometry(0.58, 0.0025, 0.012));
  const topVentSlots = new THREE.InstancedMesh(topVentSlotGeo, portMat, 28);
  for (let i = 0; i < 28; i++) {
    const side = i < 14 ? -1 : 1;
    const row = i % 14;
    tmp.position.set(side * 0.69, 0.109, -0.79 + row * 0.02);
    tmp.rotation.set(0, 0, 0);
    tmp.updateMatrix();
    topVentSlots.setMatrixAt(i, tmp.matrix);
  }
  topVentSlots.instanceMatrix.needsUpdate = true;
  root.add(topVentSlots);

  const speakerDotGeo = useGeometry(new THREE.CylinderGeometry(0.006, 0.006, 0.003, 10));
  const speakerDots = new THREE.InstancedMesh(speakerDotGeo, portMat, 120);
  let s = 0;
  for (let side = -1; side <= 1; side += 2) {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 12; col++) {
        tmp.position.set(side * 1.335, 0.102, -0.57 + col * 0.104 + row * 0.004);
        tmp.rotation.set(Math.PI * 0.5, 0, 0);
        tmp.updateMatrix();
        speakerDots.setMatrixAt(s, tmp.matrix);
        s += 1;
      }
    }
  }
  speakerDots.instanceMatrix.needsUpdate = true;
  root.add(speakerDots);

  const sideVentGeo = useGeometry(new THREE.BoxGeometry(0.01, 0.007, 0.06));
  const sideVents = new THREE.InstancedMesh(sideVentGeo, portMat, 56);
  for (let i = 0; i < 28; i++) {
    const z = -0.78 + i * 0.055;
    tmp.position.set(-1.706, 0.054, z);
    tmp.rotation.set(0, 0, 0);
    tmp.updateMatrix();
    sideVents.setMatrixAt(i, tmp.matrix);

    tmp.position.set(1.706, 0.054, z);
    tmp.rotation.set(0, 0, 0);
    tmp.updateMatrix();
    sideVents.setMatrixAt(i + 28, tmp.matrix);
  }
  sideVents.instanceMatrix.needsUpdate = true;
  root.add(sideVents);

  const footGeo = useGeometry(new RoundedBoxGeometry(0.42, 0.012, 0.18, 2, 0.006));
  const feet = new THREE.InstancedMesh(footGeo, rubberMat, 4);
  const footPositions = [
    [-1.1, -0.03, -0.7],
    [1.1, -0.03, -0.7],
    [-1.1, -0.03, 0.82],
    [1.1, -0.03, 0.82],
  ];
  for (let i = 0; i < footPositions.length; i++) {
    tmp.position.set(footPositions[i][0], footPositions[i][1], footPositions[i][2]);
    tmp.rotation.set(0, 0, 0);
    tmp.updateMatrix();
    feet.setMatrixAt(i, tmp.matrix);
  }
  feet.instanceMatrix.needsUpdate = true;
  root.add(feet);

  const hinge = new THREE.Mesh(useGeometry(new THREE.CylinderGeometry(0.028, 0.028, 2.36, 28)), darkMat);
  hinge.rotation.z = Math.PI * 0.5;
  hinge.position.set(0, 0.086, -1.04);
  root.add(hinge);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.086, -1.04);
  lidPivot.rotation.x = -0.37;
  root.add(lidPivot);

  const lidBack = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(3.2, 2.0, 0.062, 6, 0.028)), shellMat);
  lidBack.position.set(0, 0.97, -0.01);
  lidPivot.add(lidBack);

  const lidLogoRing = new THREE.Mesh(useGeometry(new THREE.RingGeometry(0.118, 0.164, 52)), logoMat);
  lidLogoRing.position.set(0, 1.04, 0.023);
  lidPivot.add(lidLogoRing);

  const lidLogoCore = new THREE.Mesh(useGeometry(new THREE.CircleGeometry(0.099, 48)), detailMat);
  lidLogoCore.position.set(0, 1.04, 0.0222);
  lidPivot.add(lidLogoCore);

  const bezel = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(3.06, 1.84, 0.028, 5, 0.01)), bezelMat);
  bezel.position.set(0, 0.97, 0.026);
  lidPivot.add(bezel);

  const panel = new THREE.Mesh(useGeometry(new THREE.PlaneGeometry(3.0, 1.79)), panelMat);
  panel.position.set(0, 0.97, 0.045);
  lidPivot.add(panel);

  const panelGlass = new THREE.Mesh(useGeometry(new THREE.PlaneGeometry(3.0, 1.79)), glassMat);
  panelGlass.position.set(0, 0.97, 0.052);
  lidPivot.add(panelGlass);

  const camDot = new THREE.Mesh(useGeometry(new THREE.CircleGeometry(0.013, 16)), darkMat);
  camDot.position.set(0, 1.79, 0.054);
  lidPivot.add(camDot);
  const camNotch = new THREE.Mesh(useGeometry(new RoundedBoxGeometry(0.1, 0.01, 0.006, 3, 0.002)), detailMat);
  camNotch.position.set(0, 1.79, 0.05);
  lidPivot.add(camNotch);

  const underGlow = new THREE.Mesh(useGeometry(new THREE.PlaneGeometry(2.5, 0.14)), underGlowMat);
  underGlow.position.set(0, 0.024, 1.105);
  root.add(underGlow);

  return {
    root,
    lidPivot,
    panel,
    panelGlass,
    keys,
    keyRows,
    keyCols,
    keyboardMat,
    panelMat,
    ledMat,
    underGlowMat,
    materials,
    geometries,
  };
}
