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

/**
 * LiquidMetal transition — floating chrome torusknot on TRANSPARENT background
 * so the persistent PhysicsScene (duck + cube + stars) shows through behind it.
 * Gives a layered depth: stars far away, duck/cube midground, chrome upfront.
 */
export default function LiquidMetalTransition({
  title = "DISPONIBLE",
  subtitle = "Prácticas · Junior · Backend / Sistemas / Seguridad",
}) {
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  return (
    <section className="liquid-metal-transition">
      <div className="liquid-metal-canvas">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 10], fov: 35 }}
          gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
          frameloop={reduced ? "demand" : "always"}
        >
          {/* NO background fill — the canvas is transparent so PhysicsScene
              shows through from z-index -1 behind the page. */}
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 10, 10]} intensity={2.4} color="#ffffff" />
          <directionalLight position={[-10, -4, -6]} intensity={1.2} color="#ff0077" />
          <directionalLight position={[6, -6, 8]} intensity={1.0} color="#00d2ff" />
          <Suspense fallback={null}>
            <Environment preset="warehouse" background={false} />
          </Suspense>
          <LiquidMetalShape reduced={reduced} />
          <ContactShadows
            position={[0, -3.2, 0]}
            opacity={theme === "dark" ? 0.55 : 0.3}
            scale={18}
            blur={2.5}
            far={10}
            color={theme === "dark" ? "#a855f7" : "#0c0c15"}
          />
        </Canvas>
      </div>

      <div className="liquid-metal-text">
        <span className="liquid-metal-badge">
          <span className="liquid-metal-badge-dot" aria-hidden="true" />
          {title}
        </span>
        <p className="liquid-metal-subtitle">{subtitle}</p>
      </div>

      <div className="liquid-metal-corners" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
    </section>
  );
}
