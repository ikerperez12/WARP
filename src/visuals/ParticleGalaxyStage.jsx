import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./ParticleGalaxyStage.css";

const PARAMS = {
  count: 6000,
  radius: 5,
  branches: 4,
  spin: 1.4,
  randomness: 0.25,
  randomnessPower: 3.2,
  insideColor: "#ff0077",
  outsideColor: "#00d2ff",
};

function Galaxy({ reduced }) {
  const ref = useRef();

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(PARAMS.count * 3);
    const colors = new Float32Array(PARAMS.count * 3);
    const inside = new THREE.Color(PARAMS.insideColor);
    const outside = new THREE.Color(PARAMS.outsideColor);

    for (let i = 0; i < PARAMS.count; i++) {
      const i3 = i * 3;
      const r = Math.random() * PARAMS.radius;
      const branchAngle = ((i % PARAMS.branches) / PARAMS.branches) * Math.PI * 2;
      const spinAngle = r * PARAMS.spin;

      const rx =
        Math.pow(Math.random(), PARAMS.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        PARAMS.randomness *
        r;
      const ry =
        Math.pow(Math.random(), PARAMS.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        PARAMS.randomness *
        r;
      const rz =
        Math.pow(Math.random(), PARAMS.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        PARAMS.randomness *
        r;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r + rx;
      positions[i3 + 1] = ry;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz;

      const mixed = inside.clone().lerp(outside, r / PARAMS.radius);
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARAMS.count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={PARAMS.count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  );
}

export default function ParticleGalaxyStage({ title, subtitle, kicker }) {
  const reduced = useReducedMotion();

  return (
    <section className="galaxy-stage">
      <div className="galaxy-canvas">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 3.5, 5], fov: 55 }}
          gl={{ antialias: false, alpha: false }}
          frameloop={reduced ? "demand" : "always"}
        >
          <color attach="background" args={["#030010"]} />
          <Galaxy reduced={reduced} />
        </Canvas>
      </div>

      <div className="galaxy-text">
        {kicker && <p className="galaxy-kicker">{kicker}</p>}
        <h2 className="galaxy-title">{title}</h2>
        {subtitle && <p className="galaxy-subtitle">{subtitle}</p>}
      </div>
    </section>
  );
}
