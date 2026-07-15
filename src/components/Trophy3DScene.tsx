import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useRef, useMemo } from "react";
import {
  Mesh,
  Group,
  AmbientLight,
  DirectionalLight,
  PointLight,
  MeshStandardMaterial,
  SphereGeometry,
  CylinderGeometry,
  TorusGeometry,
  RingGeometry,
  OctahedronGeometry,
} from "three";

const TrophyGroup: React.FC = () => {
  const frame = useCurrentFrame();
  const groupRef = useRef<Group>(null);

  const rotY = interpolate(frame, [0, 150], [0, Math.PI * 0.5]);
  const floatY = Math.sin(frame * 0.03) * 0.05;

  const glowIntensity = Math.sin(frame * 0.04) * 0.15 + 0.85;

  const goldMat = useMemo(() => new MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.85,
    roughness: 0.25,
    emissive: 0xd4af37,
    emissiveIntensity: 0.08 * glowIntensity,
    envMapIntensity: 1.2,
  }), [glowIntensity]);

  const darkGoldMat = useMemo(() => new MeshStandardMaterial({
    color: 0x8b6914,
    metalness: 0.9,
    roughness: 0.3,
    emissive: 0x8b6914,
    emissiveIntensity: 0.05,
  }), []);

  const silverMat = useMemo(() => new MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 0.95,
    roughness: 0.2,
    envMapIntensity: 1.5,
  }), []);

  const baseMat = useMemo(() => new MeshStandardMaterial({
    color: 0x2a1a0a,
    roughness: 0.8,
    metalness: 0.1,
  }), []);

  return (
    <group ref={groupRef} position={[0, -0.3 + floatY, 0]} rotation={[0, rotY, 0]}>
      <mesh position={[0, -1.4, 0]} material={baseMat}>
        <cylinderGeometry args={[1.6, 1.8, 0.15, 32]} />
      </mesh>
      <mesh position={[0, -1.25, 0]} material={silverMat}>
        <cylinderGeometry args={[0.5, 0.6, 0.25, 32]} />
      </mesh>
      <mesh position={[0, -0.9, 0]} material={silverMat}>
        <cylinderGeometry args={[0.35, 0.5, 0.45, 32]} />
      </mesh>
      <mesh position={[0, -0.6, 0]} material={darkGoldMat}>
        <cylinderGeometry args={[0.6, 0.35, 0.15, 32]} />
      </mesh>
      <mesh position={[0, -0.35, 0]} material={goldMat}>
        <cylinderGeometry args={[0.3, 0.6, 0.35, 32]} />
      </mesh>
      <mesh position={[0, 0.4, 0]} material={goldMat}>
        <sphereGeometry args={[1.1, 32, 32]} />
      </mesh>
      <mesh position={[0, 1.1, 0]} material={goldMat}>
        <torusGeometry args={[0.9, 0.08, 16, 32]} />
      </mesh>
      <mesh position={[0, 1.5, 0]} material={goldMat}>
        <octahedronGeometry args={[0.6, 0]} />
      </mesh>
      <mesh position={[0, 2.0, 0]} material={goldMat}>
        <sphereGeometry args={[0.25, 16, 16]} />
      </mesh>
      <group rotation={[0, 0, Math.PI / 4]}>
        <mesh position={[0.6, 0.8, 0]} rotation={[0, 0, -0.3]} material={goldMat}>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
        </mesh>
        <mesh position={[0.8, 1.1, 0]} rotation={[0, 0, -0.6]} material={goldMat}>
          <cylinderGeometry args={[0.035, 0.035, 0.5, 8]} />
        </mesh>
        <mesh position={[-0.6, 0.8, 0]} rotation={[0, 0, 0.3]} material={goldMat}>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
        </mesh>
        <mesh position={[-0.8, 1.1, 0]} rotation={[0, 0, 0.6]} material={goldMat}>
          <cylinderGeometry args={[0.035, 0.035, 0.5, 8]} />
        </mesh>
      </group>
    </group>
  );
};

export const Trophy3DScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(frame, [0, 15, fps * 5 - 10, fps * 5], [0, 1, 1, 0]);
  const sceneScale = spring({ frame: frame - 5, fps, config: { damping: 10, mass: 0.5 } });

  const titleOpacity = interpolate(frame, [30, 55], [0, 1]);
  const titleScale = spring({ frame: frame - 30, fps, config: { damping: 8, mass: 0.4 } });
  const subOpacity = interpolate(frame, [55, 80, fps * 4, fps * 5 - 15], [0, 1, 1, 0]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{ opacity: sceneOpacity, transform: `scale(${sceneScale})`, width: "100%", height: "100%" }}>
        <ThreeCanvas
          width={1080}
          height={1920}
          style={{ backgroundColor: "#0A0A12" }}
          camera={{ position: [0, 0.5, 5], fov: 35 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ scene, gl }) => {
            scene.add(new AmbientLight(0x222244, 0.3));
            const dl = new DirectionalLight(0xffeedd, 2.5);
            dl.position.set(4, 6, 5);
            scene.add(dl);
            const dl2 = new DirectionalLight(0x4488ff, 0.5);
            dl2.position.set(-3, 2, -4);
            scene.add(dl2);
            const pl = new PointLight(0xd4af37, 0.6, 10);
            pl.position.set(0, 3, 1);
            scene.add(pl);
            const pl2 = new PointLight(0x4488ff, 0.2, 8);
            pl2.position.set(-2, -1, 3);
            scene.add(pl2);
            gl.setClearColor(0x0a0a12, 1);
          }}
        >
          <TrophyGroup />
        </ThreeCanvas>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "22%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            fontFamily: "Arial, sans-serif",
            letterSpacing: 10,
            background: "linear-gradient(180deg, #FFF5D0 0%, #D4AF37 50%, #B8860B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 4px 30px rgba(212,175,55,0.3))",
          }}
        >
          LA GLORIA
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: 14,
            fontFamily: "Arial, sans-serif",
            marginTop: 8,
            textShadow: "0 0 30px rgba(0,0,0,0.8)",
            opacity: subOpacity,
          }}
        >
          ES ETERNA
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 300,
            color: "rgba(212,175,55,0.4)",
            letterSpacing: 8,
            fontFamily: "Arial, sans-serif",
            marginTop: 20,
            opacity: interpolate(frame, [75, 100, fps * 4, fps * 5 - 15], [0, 0.6, 0.6, 0]),
          }}
        >
          FÚTBOL · PASIÓN · VIDA
        </div>
      </div>
    </div>
  );
};
