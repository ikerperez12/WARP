import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial, Sphere } from "@react-three/drei";
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

function BubbleWithIcon({ position, size, textureUrl, reduced }) {
  const groupRef = useRef();
  const planeRef = useRef();
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  useFrame((state) => {
    if (!groupRef.current || reduced) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * 0.78 + position[0]) * 0.42;
    groupRef.current.position.x = position[0] + Math.cos(t * 0.46 + position[1]) * 0.24;
    groupRef.current.rotation.y = Math.sin(t * 0.22 + position[2]) * 0.25;
    if (planeRef.current) {
      planeRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={planeRef}>
        <planeGeometry args={[size * 1.2, size * 1.2]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.05}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Sphere args={[size, 32, 32]}>
        <MeshTransmissionMaterial
          samples={4}
          resolution={512}
          thickness={0.24}
          chromaticAberration={0.18}
          anisotropicBlur={0.1}
          distortion={0.12}
          distortionScale={0.16}
          temporalDistortion={0.03}
          iridescence={0.76}
          iridescenceIOR={1.35}
          clearcoat={1}
          transmission={0.92}
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
      { p: [-3.8, 1.35, -0.8], s: 0.95, tex: TECH_TEXTURES[0] },
      { p: [3.2, 2.1, -0.4], s: 1.12, tex: TECH_TEXTURES[1] },
      { p: [-2.2, -1.7, 0.1], s: 0.82, tex: TECH_TEXTURES[2] },
      { p: [4.1, -1.7, -1.3], s: 1.02, tex: TECH_TEXTURES[3] },
      { p: [0.4, 2.85, -2.1], s: 1.15, tex: TECH_TEXTURES[4] },
      { p: [-4.4, -0.35, -2], s: 0.88, tex: TECH_TEXTURES[5] },
      { p: [1.85, -0.2, -1.7], s: 0.74, tex: TECH_TEXTURES[6] },
      { p: [0.2, -2.45, -1.15], s: 0.92, tex: TECH_TEXTURES[7] },
    ],
    []
  );

  return (
    <>
      {bubbles.map((bubble, index) => (
        <Float
          key={index}
          speed={reduced ? 0 : 1}
          floatIntensity={0.5}
          rotationIntensity={0.04}
        >
          <Suspense fallback={null}>
            <BubbleWithIcon
              position={bubble.p}
              size={bubble.s}
              textureUrl={bubble.tex}
              reduced={reduced}
            />
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
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          frameloop={reduced ? "demand" : "always"}
        >
          <ambientLight intensity={1.45} />
          <pointLight position={[10, 10, 10]} intensity={1.6} color="#ffffff" />
          <pointLight position={[-10, -5, 5]} intensity={1.15} color="#88ffcc" />
          <pointLight position={[0, -8, 6]} intensity={0.95} color="#ff80c8" />
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
