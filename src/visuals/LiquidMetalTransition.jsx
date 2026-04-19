import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial, ContactShadows, Float, TorusKnot } from "@react-three/drei";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { useTheme } from "../theme/ThemeProvider.jsx";
import "./LiquidMetalTransition.css";

function LiquidMetalShape({ reduced }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (!meshRef.current || reduced) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t / 4);
    meshRef.current.rotation.y = Math.sin(t / 2);
  });
  return (
    <Float speed={reduced ? 0 : 2} rotationIntensity={0.9} floatIntensity={1.6}>
      <TorusKnot ref={meshRef} args={[1.8, 0.55, 220, 48]}>
        <MeshTransmissionMaterial
          backside
          backsideThickness={1}
          thickness={0.5}
          chromaticAberration={1.4}
          anisotropicBlur={0.2}
          distortion={0.45}
          distortionScale={0.45}
          temporalDistortion={0.08}
          iridescence={1}
          iridescenceIOR={1.5}
          iridescenceThicknessRange={[0, 1400]}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
          color="#ffffff"
          metalness={1}
          roughness={0}
        />
      </TorusKnot>
    </Float>
  );
}

export default function LiquidMetalTransition({ title = "LIQUID ALLOY", subtitle = "CHROMETYPE & FLUID DISTORTION" }) {
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const bg = theme === "dark" ? "#080810" : "#ece9e0";
  return (
    <section className="liquid-metal-transition" style={{ background: bg }}>
      <div className="liquid-metal-canvas">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 35 }} gl={{ antialias: true, alpha: false }} frameloop={reduced ? "demand" : "always"}>
          <color attach="background" args={[bg]} />
          <ambientLight intensity={1.4} />
          <directionalLight position={[10, 10, 10]} intensity={2.8} />
          <Suspense fallback={null}>
            <Environment preset="sunset" background={false} />
          </Suspense>
          <LiquidMetalShape reduced={reduced} />
          <ContactShadows position={[0, -3.2, 0]} opacity={theme === "dark" ? 0.75 : 0.35} scale={18} blur={2} far={10} color={theme === "dark" ? "#ffffff" : "#0c0c15"} />
        </Canvas>
      </div>

      <div className="liquid-metal-text">
        <h2 className="liquid-metal-title">{title}</h2>
        <p className="liquid-metal-subtitle">{subtitle}</p>
      </div>

      <div className="liquid-metal-corners" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
    </section>
  );
}
