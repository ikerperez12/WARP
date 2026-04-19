import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial, Sphere } from "@react-three/drei";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { useTheme } from "../theme/ThemeProvider.jsx";
import "./FrutigerAeroStage.css";

function Bubble({ position, size, reduced }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current || reduced) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * 0.8 + position[0]) * 0.5;
    ref.current.position.x = position[0] + Math.cos(t * 0.5 + position[1]) * 0.3;
    ref.current.rotation.y = t * 0.2;
  });
  return (
    <Sphere ref={ref} args={[size, 48, 48]} position={position}>
      <MeshTransmissionMaterial
        backside
        samples={4}
        thickness={0.4}
        chromaticAberration={0.35}
        anisotropicBlur={0.2}
        distortion={0.25}
        distortionScale={0.25}
        temporalDistortion={0.05}
        iridescence={0.8}
        iridescenceIOR={1.3}
        clearcoat={1}
        color="#88ffcc"
        attenuationDistance={0.6}
        attenuationColor="#ffffff"
      />
    </Sphere>
  );
}

function BubbleField({ reduced }) {
  const bubbles = [
    { p: [-3.5, 1.2, -1], s: 0.9 },
    { p: [3, 2, -0.5], s: 1.1 },
    { p: [-2, -1.5, 0], s: 0.7 },
    { p: [4, -2, -1.5], s: 0.95 },
    { p: [0, 3, -2], s: 1.2 },
    { p: [-4.5, -0.5, -2.5], s: 0.8 },
    { p: [2, -0.5, -2], s: 0.6 },
    { p: [0, -2.5, -1], s: 0.85 },
  ];
  return (
    <>
      {bubbles.map((b, i) => (
        <Float key={i} speed={reduced ? 0 : 1} floatIntensity={0.5}>
          <Bubble position={b.p} size={b.s} reduced={reduced} />
        </Float>
      ))}
    </>
  );
}

export default function FrutigerAeroStage({ title, subtitle, kicker }) {
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const bg = theme === "dark" ? "linear-gradient(180deg, #06142a 0%, #0a2c52 40%, #0f4a80 70%, #1b79c2 100%)" : "linear-gradient(180deg, #d6eaff 0%, #a8d5ff 50%, #6fb8ff 100%)";

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
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-10, -5, 5]} intensity={1} color="#88ffcc" />
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
