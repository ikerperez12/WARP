import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "../theme/ThemeProvider.jsx";
import { useReducedMotion } from "../lib/useReducedMotion.js";

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uIntensity;
varying vec2 vUv;

float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

float noise(vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  v += noise(p * 1.0) * 0.5;
  v += noise(p * 2.0) * 0.25;
  v += noise(p * 4.0) * 0.125;
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 q;
  q.x = fbm(uv + 0.02 * uTime);
  q.y = fbm(uv + vec2(1.0) + 0.03 * uTime);

  vec2 r;
  r.x = fbm(uv + q + vec2(1.7, 9.2) + 0.15 * uTime);
  r.y = fbm(uv + q + vec2(8.3, 2.8) + 0.126 * uTime);

  vec3 color = mix(uColor1, uColor2, clamp(fbm(uv + r) * 4.0, 0.0, 1.0));
  color = mix(color, uColor3, clamp(length(q), 0.0, 1.0));
  color = mix(color, vec3(1.0), clamp(length(r.x), 0.0, 1.0) * uIntensity * 0.25);

  gl_FragColor = vec4(color, 1.0);
}
`;

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const PALETTES = {
  dark: { c1: "#0a0a1a", c2: "#2a0b4a", c3: "#a855f7", highlight: 1.0 },
  light: { c1: "#f6f4ef", c2: "#ffd5e0", c3: "#c7b6ff", highlight: 0.6 },
};

function AuroraMesh({ reduced }) {
  const { theme } = useTheme();
  const meshRef = useRef();
  const palette = PALETTES[theme];

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(palette.c1) },
      uColor2: { value: new THREE.Color(palette.c2) },
      uColor3: { value: new THREE.Color(palette.c3) },
      uIntensity: { value: palette.highlight },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useMemo(() => {
    uniforms.uColor1.value.set(palette.c1);
    uniforms.uColor2.value.set(palette.c2);
    uniforms.uColor3.value.set(palette.c3);
    uniforms.uIntensity.value = palette.highlight;
  }, [theme]);

  useFrame((state) => {
    if (!meshRef.current) return;
    if (reduced) return;
    meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime() * 0.6;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[30, 30]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function AuroraBackdrop({ opacity = 1 }) {
  const reduced = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        opacity,
        pointerEvents: "none",
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        frameloop={reduced ? "demand" : "always"}
      >
        <AuroraMesh reduced={reduced} />
      </Canvas>
    </div>
  );
}
