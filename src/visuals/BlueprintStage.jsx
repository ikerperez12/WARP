import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./BlueprintStage.css";

function WireframeHelmet({ reduced }) {
  const { scene } = useGLTF("/assets/models/damaged_helmet.glb");
  const ref = useRef();
  const wireScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: "#00d2ff",
          wireframe: true,
          emissive: "#00d2ff",
          emissiveIntensity: 0.6,
          transparent: true,
          opacity: 0.42,
        });
      }
    });
    return clone;
  }, [scene]);

  useFrame((state) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.25;
  });

  return (
    <Float speed={reduced ? 0 : 1.4} rotationIntensity={0.25} floatIntensity={0.6}>
      <primitive ref={ref} object={wireScene} scale={2.2} position={[0, 0, 0]} />
    </Float>
  );
}

export default function BlueprintStage({ title, subtitle, lines = [] }) {
  const reduced = useReducedMotion();

  return (
    <section className="blueprint-stage">
      <div className="blueprint-grid" aria-hidden="true" />
      <div className="blueprint-canvas">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 7], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          frameloop={reduced ? "demand" : "always"}
        >
          <ambientLight intensity={0.35} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00d2ff" />
          <pointLight position={[-10, -5, 5]} intensity={0.7} color="#ff0077" />
          <Suspense fallback={null}>
            <WireframeHelmet reduced={reduced} />
          </Suspense>
          <gridHelper args={[30, 30, "#00d2ff", "#0a0a14"]} position={[0, -3, 0]} />
        </Canvas>
      </div>

      <div className="blueprint-text">
        <p className="blueprint-kicker">// TECH BLUEPRINT</p>
        <h2 className="blueprint-title">{title}</h2>
        {subtitle && <p className="blueprint-subtitle">{subtitle}</p>}
        {lines.length > 0 && (
          <dl className="blueprint-specs">
            {lines.map((item, i) => (
              <div className="blueprint-spec" key={i}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

useGLTF.preload("/assets/models/damaged_helmet.glb");
