"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

// A single 3D terminal panel
function TerminalPanel({
  position,
  rotation,
  scale,
  color,
  indicatorColor,
  title,
  targetPosition,
  targetRotation,
  targetScale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  indicatorColor: string;
  title: string;
  targetPosition: [number, number, number];
  targetRotation: [number, number, number];
  targetScale: number;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const pos = useMemo(() => new THREE.Vector3(...position), [position]);
  const rot = useMemo(() => new THREE.Euler(...rotation), [rotation]);
  const targetPos = useMemo(() => new THREE.Vector3(...targetPosition), [targetPosition]);
  const targetRot = useMemo(() => new THREE.Euler(...targetRotation), [targetRotation]);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.lerp(targetPos, 0.04);
    meshRef.current.rotation.x += (targetRot.x - meshRef.current.rotation.x) * 0.04;
    meshRef.current.rotation.y += (targetRot.y - meshRef.current.rotation.y) * 0.04;
    meshRef.current.rotation.z += (targetRot.z - meshRef.current.rotation.z) * 0.04;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.04
    );
  });

  return (
    <group ref={meshRef} position={pos} rotation={rot} scale={scale}>
      {/* Panel body */}
      <RoundedBox args={[2.2, 1.4, 0.08]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.1} roughness={0.8} />
      </RoundedBox>

      {/* Title bar */}
      <RoundedBox
        args={[2.2, 0.28, 0.09]}
        radius={0.06}
        smoothness={4}
        position={[0, 0.56, 0.005]}
      >
        <meshStandardMaterial color="#0f0f1a" metalness={0.1} roughness={0.8} />
      </RoundedBox>

      {/* Indicator light */}
      <mesh position={[-0.85, 0.56, 0.06]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color={indicatorColor}
          emissive={indicatorColor}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Title text */}
      <Text
        position={[-0.55, 0.56, 0.06]}
        fontSize={0.09}
        color="#8888aa"
        anchorX="left"
        font="/fonts/jetbrains-mono.woff2"
      >
        {title}
      </Text>

      {/* Terminal lines (simplified) */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.8, 0.2 - i * 0.2, 0.05]}>
          <planeGeometry args={[1.2 + Math.random() * 0.6, 0.06]} />
          <meshStandardMaterial
            color={i === 0 ? color : "#2a2a44"}
            transparent
            opacity={i === 0 ? 0.6 : 0.3}
          />
        </mesh>
      ))}

      {/* Border glow */}
      <RoundedBox args={[2.24, 1.44, 0.07]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </RoundedBox>
    </group>
  );
}

// Floating grid dots in the background
function GridDots() {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let x = -6; x <= 6; x += 1.2) {
      for (let y = -4; y <= 4; y += 1.2) {
        pts.push(new THREE.Vector3(x, y, -2));
      }
    }
    return pts;
  }, []);

  return (
    <>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#2a2a44" transparent opacity={0.4} />
        </mesh>
      ))}
    </>
  );
}

// Stage configurations for each feature
const STAGES: {
  panels: {
    pos: [number, number, number];
    rot: [number, number, number];
    scale: number;
    color: string;
    indicator: string;
    title: string;
  }[];
  cameraY: number;
  cameraRotY: number;
}[] = [
  // 0: Infinite Canvas — spread out, slight perspective
  {
    panels: [
      { pos: [-1.8, 0.8, 0], rot: [0, 0.15, 0], scale: 0.85, color: "#4a9eff", indicator: "#22c55e", title: "api-server" },
      { pos: [1.5, 0.9, -0.5], rot: [0, -0.1, 0], scale: 0.8, color: "#eab308", indicator: "#eab308", title: "claude" },
      { pos: [-1.2, -0.7, 0.3], rot: [0, 0.08, 0], scale: 0.75, color: "#22c55e", indicator: "#4a9eff", title: "dev-server" },
      { pos: [1.8, -0.6, -0.2], rot: [0, -0.12, 0], scale: 0.7, color: "#22c55e", indicator: "#22c55e", title: "tests" },
    ],
    cameraY: 0,
    cameraRotY: 0,
  },
  // 1: AI Indicators — panels closer, indicators prominent
  {
    panels: [
      { pos: [-1.5, 0.6, 0.5], rot: [0.05, 0.2, 0], scale: 0.9, color: "#4a9eff", indicator: "#4a9eff", title: "api-server" },
      { pos: [1.2, 0.7, 0.3], rot: [-0.05, -0.15, 0], scale: 0.9, color: "#eab308", indicator: "#eab308", title: "claude" },
      { pos: [-0.8, -0.6, 0.8], rot: [0.08, 0.1, 0], scale: 0.85, color: "#22c55e", indicator: "#22c55e", title: "dev-server" },
      { pos: [1.5, -0.5, 0.4], rot: [-0.03, -0.2, 0], scale: 0.85, color: "#22c55e", indicator: "#22c55e", title: "tests" },
    ],
    cameraY: 0,
    cameraRotY: 0.1,
  },
  // 2: Snap Guides — panels aligned neatly
  {
    panels: [
      { pos: [-1.2, 0.75, 0], rot: [0, 0, 0], scale: 0.82, color: "#4a9eff", indicator: "#22c55e", title: "api-server" },
      { pos: [1.2, 0.75, 0], rot: [0, 0, 0], scale: 0.82, color: "#4a9eff", indicator: "#eab308", title: "claude" },
      { pos: [-1.2, -0.75, 0], rot: [0, 0, 0], scale: 0.82, color: "#4a9eff", indicator: "#4a9eff", title: "dev-server" },
      { pos: [1.2, -0.75, 0], rot: [0, 0, 0], scale: 0.82, color: "#4a9eff", indicator: "#22c55e", title: "tests" },
    ],
    cameraY: 0,
    cameraRotY: -0.15,
  },
  // 3: Projects — grouped with colored borders
  {
    panels: [
      { pos: [-1.6, 0.5, 0.2], rot: [0, 0.12, -0.03], scale: 0.8, color: "#4a9eff", indicator: "#22c55e", title: "api-server" },
      { pos: [-1.6, -0.5, 0.2], rot: [0, 0.12, 0.03], scale: 0.8, color: "#4a9eff", indicator: "#4a9eff", title: "dev-server" },
      { pos: [1.6, 0.5, -0.2], rot: [0, -0.12, 0.03], scale: 0.8, color: "#eab308", indicator: "#eab308", title: "claude" },
      { pos: [1.6, -0.5, -0.2], rot: [0, -0.12, -0.03], scale: 0.8, color: "#22c55e", indicator: "#22c55e", title: "tests" },
    ],
    cameraY: 0.2,
    cameraRotY: 0.2,
  },
  // 4: Focus Mode — one panel big, others small/faded
  {
    panels: [
      { pos: [0, 0, 1.5], rot: [0, 0, 0], scale: 1.3, color: "#4a9eff", indicator: "#22c55e", title: "api-server" },
      { pos: [-2.5, 1, -1], rot: [0, 0.3, 0], scale: 0.4, color: "#4a9eff", indicator: "#eab308", title: "claude" },
      { pos: [2.5, -0.5, -1.5], rot: [0, -0.3, 0], scale: 0.35, color: "#22c55e", indicator: "#4a9eff", title: "dev-server" },
      { pos: [-2, -1.2, -1], rot: [0, 0.2, 0], scale: 0.35, color: "#22c55e", indicator: "#22c55e", title: "tests" },
    ],
    cameraY: 0,
    cameraRotY: 0,
  },
  // 5: Window Embedding — extra panel slides in
  {
    panels: [
      { pos: [-1.5, 0.6, 0.3], rot: [0, 0.1, 0], scale: 0.75, color: "#4a9eff", indicator: "#22c55e", title: "api-server" },
      { pos: [0, 0.7, 0.5], rot: [0, 0, 0], scale: 0.75, color: "#eab308", indicator: "#eab308", title: "claude" },
      { pos: [-0.8, -0.6, 0.2], rot: [0, 0.05, 0], scale: 0.7, color: "#22c55e", indicator: "#4a9eff", title: "dev-server" },
      { pos: [1.8, 0, 0.8], rot: [0, -0.15, 0], scale: 0.85, color: "#a855f7", indicator: "#a855f7", title: "VS Code" },
    ],
    cameraY: -0.1,
    cameraRotY: -0.1,
  },
];

function Scene({ activeIndex }: { activeIndex: number }) {
  const stage = STAGES[Math.min(activeIndex, STAGES.length - 1)];
  const groupRef = useRef<THREE.Group>(null);

  // Gentle idle float
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += (stage.cameraRotY - groupRef.current.rotation.y) * 0.03;
    groupRef.current.position.y =
      Math.sin(clock.getElapsedTime() * 0.5) * 0.05 + stage.cameraY;
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-3, 2, 4]} intensity={0.3} color="#4a9eff" />
      <pointLight position={[3, -2, 3]} intensity={0.2} color="#22c55e" />

      <group ref={groupRef}>
        <GridDots />

        {stage.panels.map((panel, i) => (
          <TerminalPanel
            key={i}
            position={STAGES[0].panels[i]?.pos ?? panel.pos}
            rotation={STAGES[0].panels[i]?.rot ?? panel.rot}
            scale={STAGES[0].panels[i]?.scale ?? panel.scale}
            targetPosition={panel.pos}
            targetRotation={panel.rot}
            targetScale={panel.scale}
            color={panel.color}
            indicatorColor={panel.indicator}
            title={panel.title}
          />
        ))}
      </group>
    </>
  );
}

export function FeatureCanvas3D({ activeIndex }: { activeIndex: number }) {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{
        aspectRatio: "16/10",
        background: "#0a0a16",
        border: "1px solid #2a2a44",
        boxShadow: "0 20px 50px -12px rgba(0,0,0,0.5)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene activeIndex={activeIndex} />
      </Canvas>
    </div>
  );
}
