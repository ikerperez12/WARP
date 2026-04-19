import { useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Stars,
  useGLTF,
  ContactShadows,
  RoundedBox,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { useTheme } from "../theme/ThemeProvider.jsx";

function FloatingModel({ url, initialPosition, scale, mass = 1, reduced }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  useEffect(() => {
    if (reduced) return;

    // Velocidad inicial aleatoria suave pero visible — el objeto empieza en movimiento
    const bootstrap = setTimeout(() => {
      if (!ref.current) return;
      ref.current.setLinvel(
        {
          x: (Math.random() - 0.5) * 3.5,
          y: (Math.random() - 0.5) * 2.8,
          z: (Math.random() - 0.5) * 1.2,
        },
        true
      );
      ref.current.setAngvel(
        {
          x: (Math.random() - 0.5) * 1.4,
          y: (Math.random() - 0.5) * 1.4,
          z: (Math.random() - 0.5) * 0.8,
        },
        true
      );
    }, 180);

    // Pulso de correccion suave: si pierde velocidad, lo empujamos otra vez
    // Esto mantiene el "DVD screensaver" pero sin violencia
    const keepAlive = setInterval(() => {
      if (!ref.current) return;
      const linvel = ref.current.linvel();
      const speed = Math.sqrt(linvel.x ** 2 + linvel.y ** 2 + linvel.z ** 2);
      // Solo empujamos si va demasiado lento
      if (speed < 1.2) {
        ref.current.applyImpulse(
          {
            x: (Math.random() - 0.5) * 1.8,
            y: (Math.random() - 0.5) * 1.8,
            z: (Math.random() - 0.5) * 0.8,
          },
          true
        );
        ref.current.applyTorqueImpulse(
          {
            x: (Math.random() - 0.5) * 0.4,
            y: (Math.random() - 0.5) * 0.4,
            z: (Math.random() - 0.5) * 0.25,
          },
          true
        );
      }
    }, 1800);

    return () => {
      clearTimeout(bootstrap);
      clearInterval(keepAlive);
    };
  }, [reduced]);

  return (
    <RigidBody
      ref={ref}
      type="dynamic"
      position={initialPosition}
      colliders="hull"
      restitution={0.95}
      friction={0.02}
      linearDamping={0.06}
      angularDamping={0.08}
      mass={mass}
      canSleep={false}
    >
      <primitive object={scene.clone()} scale={scale} />
    </RigidBody>
  );
}

function FloatingCube({ initialPosition, color = "#ff0033", reduced }) {
  const ref = useRef();
  useEffect(() => {
    if (reduced) return;
    const bootstrap = setTimeout(() => {
      if (!ref.current) return;
      ref.current.setLinvel(
        {
          x: (Math.random() - 0.5) * 3.2,
          y: (Math.random() - 0.5) * 2.6,
          z: (Math.random() - 0.5) * 1,
        },
        true
      );
      ref.current.setAngvel(
        {
          x: (Math.random() - 0.5) * 1.2,
          y: (Math.random() - 0.5) * 1.2,
          z: (Math.random() - 0.5) * 0.7,
        },
        true
      );
    }, 200);
    const keepAlive = setInterval(() => {
      if (!ref.current) return;
      const linvel = ref.current.linvel();
      const speed = Math.sqrt(linvel.x ** 2 + linvel.y ** 2 + linvel.z ** 2);
      if (speed < 1.2) {
        ref.current.applyImpulse(
          {
            x: (Math.random() - 0.5) * 1.6,
            y: (Math.random() - 0.5) * 1.6,
            z: (Math.random() - 0.5) * 0.7,
          },
          true
        );
      }
    }, 1800);
    return () => {
      clearTimeout(bootstrap);
      clearInterval(keepAlive);
    };
  }, [reduced]);

  return (
    <RigidBody
      ref={ref}
      position={initialPosition}
      colliders="cuboid"
      restitution={0.95}
      friction={0.02}
      linearDamping={0.06}
      angularDamping={0.08}
      mass={2}
      canSleep={false}
    >
      <RoundedBox args={[1.15, 1.15, 1.15]} radius={0.15} smoothness={4}>
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.85}
          chromaticAberration={0.5}
          anisotropicBlur={0.3}
          distortion={0.35}
          distortionScale={0.35}
          temporalDistortion={0.08}
          color={color}
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
        />
      </RoundedBox>
    </RigidBody>
  );
}

function Boundaries() {
  // Caja generosa 16x12x8 (wider than viewport, sirve como "parque" de juego)
  return (
    <>
      <CuboidCollider position={[0, -6.5, 0]} args={[20, 1.5, 12]} restitution={1} friction={0} />
      <CuboidCollider position={[0, 6.5, 0]} args={[20, 1.5, 12]} restitution={1} friction={0} />
      <CuboidCollider position={[-11, 0, 0]} args={[1.5, 10, 12]} restitution={1} friction={0} />
      <CuboidCollider position={[11, 0, 0]} args={[1.5, 10, 12]} restitution={1} friction={0} />
      <CuboidCollider position={[0, 0, -4.5]} args={[20, 10, 1.5]} restitution={1} friction={0} />
      <CuboidCollider position={[0, 0, 3]} args={[20, 10, 1.5]} restitution={1} friction={0} />
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
        intensity={isDark ? 2.6 : 1.5}
        color="#a855f7"
        castShadow
      />
      <pointLight position={[-10, -8, -8]} intensity={isDark ? 1.7 : 0.9} color="#00d2ff" />
      <pointLight position={[0, 9, -4]} intensity={isDark ? 0.9 : 0.5} color="#ff0077" />

      {isDark && (
        <Stars
          radius={120}
          depth={60}
          count={reduced ? 1500 : 5500}
          factor={4.5}
          saturation={0.5}
          fade
          speed={reduced ? 0 : 1}
        />
      )}

      <Physics gravity={[0, 0, 0]} paused={reduced} timeStep={1 / 120}>
        <Boundaries />
        <Suspense fallback={null}>
          <FloatingModel
            url="/assets/models/duck.glb"
            initialPosition={[-3.5, 2.2, 0]}
            scale={1.15}
            mass={1.1}
            reduced={reduced}
          />
          <FloatingCube initialPosition={[3.8, -1.5, 0]} color="#ff0033" reduced={reduced} />
        </Suspense>
      </Physics>

      <ContactShadows
        position={[0, -5.5, 0]}
        opacity={isDark ? 0.45 : 0.22}
        scale={38}
        blur={2.5}
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
        camera={{ position: [0, 0, 9], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={reduced ? "demand" : "always"}
      >
        <World reduced={reduced} isDark={isDark} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/assets/models/duck.glb");
