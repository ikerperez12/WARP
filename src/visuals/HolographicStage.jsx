import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, RoundedBox, ContactShadows } from "@react-three/drei";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { useTheme } from "../theme/ThemeProvider.jsx";

function HolographicCard({ reduced }) {
  const cardRef = useRef();
  useFrame((state) => {
    if (!cardRef.current || reduced) return;
    const t = state.clock.getElapsedTime();
    cardRef.current.rotation.y = Math.sin(t * 0.5) * 0.3;
    cardRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
  });

  return (
    <Float speed={reduced ? 0 : 2.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <group ref={cardRef}>
        <RoundedBox args={[3.2, 4.8, 0.18]} radius={0.18} smoothness={4}>
          <meshPhysicalMaterial
            color="#0a0a14"
            roughness={0.1}
            metalness={0.85}
            clearcoat={1}
            clearcoatRoughness={0}
            iridescence={1}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[100, 400]}
            envMapIntensity={2.2}
          />
        </RoundedBox>
        <mesh position={[0, -0.6, 0.15]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <icosahedronGeometry args={[0.7, 0]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={1}
            roughness={0.1}
            iridescence={1}
            iridescenceIOR={1.5}
            iridescenceThicknessRange={[400, 800]}
          />
        </mesh>
        <mesh position={[0, 1, 0.12]}>
          <torusGeometry args={[0.5, 0.08, 24, 48]} />
          <meshPhysicalMaterial
            color="#ff0077"
            metalness={0.9}
            roughness={0.15}
            iridescence={0.8}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function HolographicStage({ height = 520 }) {
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const bg = theme === "light" ? "#f6f4ef" : "#020202";

  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        height,
        borderRadius: "1.5rem",
        overflow: "hidden",
        background: bg,
        border: "1px solid var(--border-soft)",
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8.5], fov: 40 }}
        gl={{ antialias: true, alpha: false }}
        frameloop={reduced ? "demand" : "always"}
      >
        <color attach="background" args={[bg]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 10, 5]} intensity={1.8} color="#00d2ff" />
        <directionalLight position={[-5, 10, -5]} intensity={1.8} color="#ff0077" />
        <Suspense fallback={null}>
          <Environment preset="warehouse" />
        </Suspense>
        <HolographicCard reduced={reduced} />
        <ContactShadows position={[0, -3.2, 0]} opacity={0.5} scale={14} blur={1.5} far={8} color="#000" />
      </Canvas>
    </div>
  );
}
