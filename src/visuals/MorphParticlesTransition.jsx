import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { useTheme } from "../theme/ThemeProvider.jsx";
import "./MorphParticlesTransition.css";

const COUNT = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches ? 1000 : 2000;

function MorphPoints({ shape, reduced, accent }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const shapes = {};
    // sphere
    const sphere = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 3;
      sphere[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      sphere[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      sphere[i * 3 + 2] = r * Math.cos(phi);
    }
    shapes.sphere = sphere;

    // cube
    const cube = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      cube[i * 3] = (Math.random() - 0.5) * 5;
      cube[i * 3 + 1] = (Math.random() - 0.5) * 5;
      cube[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    shapes.cube = cube;

    // torus
    const torus = new Float32Array(COUNT * 3);
    const R = 2.5;
    const r = 0.9;
    for (let i = 0; i < COUNT; i++) {
      const u = Math.random() * 2 * Math.PI;
      const v = Math.random() * 2 * Math.PI;
      torus[i * 3] = (R + r * Math.cos(v)) * Math.cos(u);
      torus[i * 3 + 1] = (R + r * Math.cos(v)) * Math.sin(u);
      torus[i * 3 + 2] = r * Math.sin(v);
    }
    shapes.torus = torus;

    return shapes;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const target = positions[shape];
    const current = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < COUNT * 3; i++) {
      current[i] = THREE.MathUtils.lerp(current[i], target[i], 0.04);
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    if (!reduced) ref.current.rotation.y = state.clock.getElapsedTime() * 0.08;
  });

  return (
    <Points ref={ref} positions={positions.sphere} stride={3}>
      <PointMaterial
        transparent
        color={accent}
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function MorphParticlesTransition({
  title = "METAMORPH",
  subtitle = "Interactive Particle Geometry",
  lines = [],
  autoShapes = ["sphere", "torus", "cube"],
}) {
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const [shape, setShape] = useState(autoShapes[0]);

  useEffect(() => {
    if (reduced) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % autoShapes.length;
      setShape(autoShapes[i]);
    }, 4500);
    return () => clearInterval(id);
  }, [autoShapes, reduced]);

  const bg = theme === "dark" ? "#030306" : "#f1efe9";
  const accent = theme === "dark" ? "#00d2ff" : "#6c2e9c";

  return (
    <section className="morph-transition" style={{ background: bg }}>
      <div className="morph-transition-canvas">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 9.5], fov: 45 }}
          gl={{ antialias: false, alpha: false }}
          frameloop={reduced ? "demand" : "always"}
        >
          <color attach="background" args={[bg]} />
          <ambientLight intensity={0.5} />
          <MorphPoints shape={shape} reduced={reduced} accent={accent} />
        </Canvas>
      </div>

      <div className="morph-transition-text">
        <span className="morph-transition-kicker">{shape.toUpperCase()} MODE</span>
        <h2 className="morph-transition-title">{title}</h2>
        <p className="morph-transition-subtitle">{subtitle}</p>
        {lines.length > 0 && (
          <ul className="morph-transition-lines">
            {lines.map((line, i) => (
              <li key={i} style={{ "--i": i }}>
                <span aria-hidden="true">›</span>
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="morph-transition-shape-toggle">
        {autoShapes.map((s) => (
          <button
            key={s}
            type="button"
            className={shape === s ? "is-active" : ""}
            onClick={() => setShape(s)}
            aria-label={`Morph to ${s}`}
          >
            {s}
          </button>
        ))}
      </div>
    </section>
  );
}
