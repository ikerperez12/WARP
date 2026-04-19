import { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Stars,
  useGLTF,
  ContactShadows,
  RoundedBox,
  MeshTransmissionMaterial,
  Float,
} from "@react-three/drei";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { useTheme } from "../theme/ThemeProvider.jsx";

function PhysicalModel({
  url,
  position,
  rotation = [0, 0, 0],
  scale,
  isFixed = false,
  mass = 1,
  reduced,
  impulseScale = 1,
}) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  useEffect(() => {
    if (isFixed || reduced) return;
    const gentleKick = () => {
      if (!ref.current) return;
      ref.current.applyImpulse(
        {
          x: (Math.random() - 0.5) * 1.1 * impulseScale,
          y: (Math.random() - 0.5) * 1.1 * impulseScale,
          z: (Math.random() - 0.5) * 0.6 * impulseScale,
        },
        true
      );
      ref.current.applyTorqueImpulse(
        {
          x: (Math.random() - 0.5) * 0.35 * impulseScale,
          y: (Math.random() - 0.5) * 0.35 * impulseScale,
          z: (Math.random() - 0.5) * 0.25 * impulseScale,
        },
        true
      );
    };

    const bootstrap = setTimeout(() => {
      if (!ref.current) return;
      ref.current.applyImpulse(
        {
          x: (Math.random() - 0.5) * 2.2 * impulseScale,
          y: (Math.random() - 0.5) * 2.2 * impulseScale,
          z: (Math.random() - 0.5) * 0.4 * impulseScale,
        },
        true
      );
    }, 220);

    const beat = setInterval(gentleKick, 7500 + Math.random() * 1500);
    return () => {
      clearTimeout(bootstrap);
      clearInterval(beat);
    };
  }, [isFixed, reduced, impulseScale]);

  return (
    <RigidBody
      ref={ref}
      type={isFixed ? "fixed" : "dynamic"}
      position={position}
      rotation={rotation}
      colliders="hull"
      restitution={0.75}
      friction={0.08}
      linearDamping={0.35}
      angularDamping={0.3}
      mass={mass}
      canSleep={false}
    >
      <primitive object={scene.clone()} scale={scale} />
    </RigidBody>
  );
}

function PremiumCube({ position, color = "#ff00aa", reduced, impulseScale = 1 }) {
  const ref = useRef();
  useEffect(() => {
    if (reduced) return;
    const kick = () => {
      if (!ref.current) return;
      ref.current.applyImpulse(
        {
          x: (Math.random() - 0.5) * 1.1 * impulseScale,
          y: (Math.random() - 0.5) * 1.1 * impulseScale,
          z: (Math.random() - 0.5) * 0.5 * impulseScale,
        },
        true
      );
    };
    const bootstrap = setTimeout(() => {
      if (!ref.current) return;
      ref.current.applyImpulse(
        {
          x: (Math.random() - 0.5) * 2.0 * impulseScale,
          y: (Math.random() - 0.5) * 2.0 * impulseScale,
          z: (Math.random() - 0.5) * 0.4 * impulseScale,
        },
        true
      );
    }, 250);
    const beat = setInterval(kick, 8000 + Math.random() * 1500);
    return () => {
      clearTimeout(bootstrap);
      clearInterval(beat);
    };
  }, [reduced, impulseScale]);

  return (
    <RigidBody
      ref={ref}
      position={position}
      colliders="cuboid"
      restitution={0.7}
      friction={0.1}
      linearDamping={0.4}
      angularDamping={0.35}
      mass={2}
      canSleep={false}
    >
      <RoundedBox args={[1.1, 1.1, 1.1]} radius={0.14} smoothness={4}>
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.8}
          chromaticAberration={0.45}
          anisotropicBlur={0.3}
          distortion={0.3}
          distortionScale={0.3}
          temporalDistortion={0.06}
          color={color}
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
        />
      </RoundedBox>
    </RigidBody>
  );
}

function FloatingIcosahedron({ position, color = "#00d2ff", reduced }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current || reduced) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = t * 0.15;
    ref.current.rotation.y = t * 0.2;
  });
  return (
    <Float speed={reduced ? 0 : 1.2} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[0.65, 0]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.85}
          roughness={0.12}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[100, 400]}
        />
      </mesh>
    </Float>
  );
}

function Boundaries() {
  return (
    <>
      <CuboidCollider position={[0, -5, 0]} args={[18, 1.2, 18]} restitution={0.65} friction={0.05} />
      <CuboidCollider position={[0, 5, 0]} args={[18, 1.2, 18]} restitution={0.65} friction={0.05} />
      <CuboidCollider position={[-9, 0, 0]} args={[1.2, 9, 18]} restitution={0.65} friction={0.05} />
      <CuboidCollider position={[9, 0, 0]} args={[1.2, 9, 18]} restitution={0.65} friction={0.05} />
      <CuboidCollider position={[0, 0, -5]} args={[18, 9, 1.2]} restitution={0.65} friction={0.05} />
      <CuboidCollider position={[0, 0, 3]} args={[18, 9, 1.2]} restitution={0.65} friction={0.05} />
    </>
  );
}

function World({ reduced, isDark }) {
  const bg = isDark ? "#020205" : "#f6f4ef";
  return (
    <>
      <color attach="background" args={[bg]} />
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      <ambientLight intensity={isDark ? 0.65 : 1.05} />
      <spotLight
        position={[9, 10, 9]}
        angle={0.22}
        penumbra={1}
        intensity={isDark ? 2.4 : 1.4}
        color="#a855f7"
        castShadow
      />
      <pointLight position={[-10, -8, -8]} intensity={isDark ? 1.6 : 0.8} color="#00d2ff" />
      <pointLight position={[0, 9, -4]} intensity={isDark ? 0.85 : 0.5} color="#ff0077" />

      {isDark && (
        <Stars
          radius={100}
          depth={50}
          count={reduced ? 1200 : 4500}
          factor={4}
          saturation={0.5}
          fade
          speed={reduced ? 0 : 0.8}
        />
      )}

      <Physics gravity={[0, 0, 0]} paused={reduced} timeStep={1 / 90}>
        <Boundaries />
        <Suspense fallback={null}>
          <PhysicalModel
            url="/assets/models/duck.glb"
            position={[-1.8, 1.2, 0.5]}
            scale={1.8}
            mass={1.2}
            reduced={reduced}
          />
          <PremiumCube position={[2.6, -0.4, 0.5]} reduced={reduced} color="#ff0077" />
          <PhysicalModel
            url="/assets/models/toycar.glb"
            position={[-6.5, -3.6, 1.2]}
            rotation={[-0.25, Math.PI / 12, 0]}
            scale={55}
            isFixed
            mass={5}
            reduced={reduced}
          />
          <PhysicalModel
            url="/assets/models/bust.glb"
            position={[6.8, 2.6, -0.2]}
            rotation={[0, -Math.PI / 4, 0]}
            scale={1.3}
            isFixed
            mass={5}
            reduced={reduced}
          />
          <PhysicalModel
            url="/assets/models/elegant.glb"
            position={[7.2, -3.2, 0.8]}
            rotation={[0, -Math.PI / 3, 0]}
            scale={1.3}
            isFixed
            mass={5}
            reduced={reduced}
          />
        </Suspense>
        <FloatingIcosahedron position={[-4.8, 2.8, -1]} reduced={reduced} color="#00d2ff" />
        <FloatingIcosahedron position={[4.5, 3, -1.5]} reduced={reduced} color="#a855f7" />
      </Physics>

      <ContactShadows
        position={[0, -4.8, 0]}
        opacity={isDark ? 0.5 : 0.28}
        scale={36}
        blur={2.2}
        far={9}
        color={isDark ? "#a855f7" : "#0c0c15"}
      />
    </>
  );
}

export default function PhysicsScene() {
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="physics-scene"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8.5], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={reduced ? "demand" : "always"}
      >
        <World reduced={reduced} isDark={isDark} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/assets/models/duck.glb");
useGLTF.preload("/assets/models/toycar.glb");
useGLTF.preload("/assets/models/bust.glb");
useGLTF.preload("/assets/models/elegant.glb");
