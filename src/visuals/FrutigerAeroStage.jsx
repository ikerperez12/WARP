import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment, Float, Sphere, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { useTheme } from "../theme/ThemeProvider.jsx";
import "./FrutigerAeroStage.css";

const TECH_TEXTURES = [
  "/assets/images/tech/Docker_(Ballena)___Figura_202604102120.png",
  "/assets/images/tech/Java___Taza_de_202604102120.png",
  "/assets/images/tech/Python___Dos_serpientes_202604102120.png",
  "/assets/images/tech/React___Símbolo_de_202604102121.png",
  "/assets/images/tech/JavaScript___Cubo_3D_202604102121.png",
  "/assets/images/tech/Linux___Figura_3D_202604102121.png",
  "/assets/images/tech/GitHub_(Octocat)___Figura_202604102120.png",
  "/assets/images/tech/Postman___Figura_3D_202604102120.png",
];

/**
 * A bubble is a transparent sphere + a smaller inner billboarded plane with a
 * tech-icon texture. Viewer sees the icon THROUGH the glass — the sphere's
 * transmission+iridescence refracts and softens it, which reads as a "bubble
 * containing the icon".
 */
function BubbleWithIcon({ position, size, textureUrl, reduced }) {
  const groupRef = useRef();
  const planeRef = useRef();
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  useFrame((state) => {
    if (!groupRef.current || reduced) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * 0.8 + position[0]) * 0.4;
    groupRef.current.position.x = position[0] + Math.cos(t * 0.5 + position[1]) * 0.25;
    groupRef.current.rotation.y = t * 0.2;
    if (planeRef.current) {
      // Keep the icon plane facing the camera (billboard)
      planeRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Inner icon plane — what the bubble "contains" */}
      <mesh ref={planeRef} position={[0, 0, 0]}>
        <planeGeometry args={[size * 1.25, size * 1.25]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.05}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer transmission sphere — the glass */}
      <Sphere args={[size, 48, 48]}>
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.25}
          chromaticAberration={0.25}
          anisotropicBlur={0.1}
          distortion={0.15}
          distortionScale={0.2}
          temporalDistortion={0.04}
          iridescence={0.7}
          iridescenceIOR={1.3}
          clearcoat={1}
          transmission={0.9}
          color="#cfffee"
          attenuationDistance={1.2}
          attenuationColor="#ffffff"
        />
      </Sphere>
    </group>
  );
}

function BubbleField({ reduced }) {
  const bubbles = useMemo(
    () => [
      { p: [-3.5, 1.2, -1], s: 0.95, tex: TECH_TEXTURES[0] },
      { p: [3, 2, -0.5], s: 1.1, tex: TECH_TEXTURES[1] },
      { p: [-2, -1.5, 0], s: 0.75, tex: TECH_TEXTURES[2] },
      { p: [4, -2, -1.5], s: 1.0, tex: TECH_TEXTURES[3] },
      { p: [0, 2.8, -2], s: 1.25, tex: TECH_TEXTURES[4] },
      { p: [-4.5, -0.5, -2.5], s: 0.8, tex: TECH_TEXTURES[5] },
      { p: [2, -0.5, -2], s: 0.65, tex: TECH_TEXTURES[6] },
      { p: [0, -2.5, -1], s: 0.9, tex: TECH_TEXTURES[7] },
    ],
    []
  );
  return (
    <>
      {bubbles.map((b, i) => (
        <Float key={i} speed={reduced ? 0 : 1} floatIntensity={0.5}>
          <Suspense fallback={null}>
            <BubbleWithIcon position={b.p} size={b.s} textureUrl={b.tex} reduced={reduced} />
          </Suspense>
        </Float>
      ))}
    </>
  );
}

export default function FrutigerAeroStage({ title, subtitle, kicker }) {
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const bg =
    theme === "dark"
      ? "linear-gradient(180deg, #06142a 0%, #0a2c52 40%, #0f4a80 70%, #1b79c2 100%)"
      : "linear-gradient(180deg, #d6eaff 0%, #a8d5ff 50%, #6fb8ff 100%)";

  return (
    <section className="frutiger-stage" style={{ background: bg }}>
      <div className="frutiger-stage-canvas">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 8], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          frameloop={reduced ? "demand" : "always"}
        >
          <ambientLight intensity={1.4} />
          <pointLight position={[10, 10, 10]} intensity={1.6} color="#ffffff" />
          <pointLight position={[-10, -5, 5]} intensity={1.1} color="#88ffcc" />
          <pointLight position={[0, -8, 6]} intensity={0.9} color="#ff80c8" />
          <Suspense fallback={null}>
            <Environment preset="sunset" />
          </Suspense>
          <BubbleField reduced={reduced} />
        </Canvas>
      </div>

      <div className="frutiger-stage-text">
        {kicker && <p className="frutiger-stage-kicker">{kicker}</p>}
        <h2 className="frutiger-stage-title">{title}</h2>
        {subtitle && <p className="frutiger-stage-subtitle">{subtitle}</p>}
      </div>
    </section>
  );
}
