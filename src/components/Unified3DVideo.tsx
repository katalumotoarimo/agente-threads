import { interpolate, spring, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useRef, useMemo } from "react";
import {
  Mesh,
  Group,
  Points,
  PointsMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  AdditiveBlending,
  AmbientLight,
  DirectionalLight,
  PointLight,
  MeshStandardMaterial,
  CanvasTexture,
  Color,
} from "three";
import { generateSoccerBallTexture } from "./SoccerBallTexture";

const StarField: React.FC<{ frame: number }> = ({ frame }) => {
  const ref = useRef<Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 2000;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 8 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.cos(phi) * 0.5;
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 10;
      const c = new Color().setHSL(0.1 + Math.random() * 0.05, 0.3, 0.5 + Math.random() * 0.5);
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: cols };
  }, []);

  return (
    <points ref={ref} rotation={[frame * 0.0005, frame * 0.0008, 0]}>
      <bufferGeometry>
        <float32BufferAttribute attach="attributes-position" args={[positions, 3]} />
        <float32BufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.7} blending={AdditiveBlending} sizeAttenuation depthWrite={false} />
    </points>
  );
};

const SoccerBall: React.FC<{ frame: number }> = ({ frame }) => {
  const meshRef = useRef<Mesh>(null);
  const texture = useMemo(() => {
    const canvas = generateSoccerBallTexture(1024);
    const tex = new CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
  }, []);

  const rotY = interpolate(frame, [150, 300], [0, Math.PI * 4]);
  const rotX = interpolate(frame, [150, 300], [0, Math.PI * 0.3]);
  const floatY = Math.sin((frame - 150) * 0.04) * 0.15;
  const ballScale = spring({ frame: frame - 155, fps: 30, config: { damping: 12, mass: 0.6 } });

  return (
    <mesh ref={meshRef} position={[0, floatY, 0]} rotation={[rotX, rotY, 0]} scale={[ballScale, ballScale, ballScale]}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={0.35} metalness={0.05} envMapIntensity={0.6} />
    </mesh>
  );
};

const Trophy3D: React.FC<{ frame: number }> = ({ frame }) => {
  const groupRef = useRef<Group>(null);
  const rotY = interpolate(frame, [300, 450], [0, Math.PI * 0.5]);
  const floatY = Math.sin((frame - 300) * 0.03) * 0.05;
  const trophyScale = spring({ frame: frame - 305, fps: 30, config: { damping: 10, mass: 0.5 } });

  const goldMat = useMemo(() => new MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25, emissive: 0xd4af37, emissiveIntensity: 0.06 }), []);
  const darkGoldMat = useMemo(() => new MeshStandardMaterial({ color: 0x8b6914, metalness: 0.9, roughness: 0.3 }), []);
  const silverMat = useMemo(() => new MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.95, roughness: 0.2 }), []);
  const baseMat = useMemo(() => new MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.8, metalness: 0.1 }), []);

  return (
    <group ref={groupRef} position={[0, -0.3 + floatY, 0]} rotation={[0, rotY, 0]} scale={[trophyScale, trophyScale, trophyScale]}>
      <mesh position={[0, -1.4, 0]} material={baseMat}><cylinderGeometry args={[1.6, 1.8, 0.15, 32]} /></mesh>
      <mesh position={[0, -1.25, 0]} material={silverMat}><cylinderGeometry args={[0.5, 0.6, 0.25, 32]} /></mesh>
      <mesh position={[0, -0.9, 0]} material={silverMat}><cylinderGeometry args={[0.35, 0.5, 0.45, 32]} /></mesh>
      <mesh position={[0, -0.6, 0]} material={darkGoldMat}><cylinderGeometry args={[0.6, 0.35, 0.15, 32]} /></mesh>
      <mesh position={[0, -0.35, 0]} material={goldMat}><cylinderGeometry args={[0.3, 0.6, 0.35, 32]} /></mesh>
      <mesh position={[0, 0.4, 0]} material={goldMat}><sphereGeometry args={[1.0, 32, 32]} /></mesh>
    </group>
  );
};

const Scene1Title: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 15, 145, 150], [0, 1, 1, 0]);
  const yearY = interpolate(frame, [25, 50], [30, 0]);
  const yearOpacity = interpolate(frame, [25, 50, 145, 150], [0, 1, 1, 0]);
  const subOpacity = interpolate(frame, [55, 80, 145, 150], [0, 1, 1, 0]);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity, background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.2) 0%, rgba(5,5,8,0.6) 60%, rgba(5,5,8,0.9) 100%)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 72, fontWeight: 700, color: "#FFFFFF", letterSpacing: 24, fontFamily: "Arial, sans-serif", textShadow: "0 0 60px rgba(0,0,0,0.9)", lineHeight: 1.2 }}>
          COPA DEL
        </div>
        <div style={{ fontSize: 170, fontWeight: 900, letterSpacing: 20, lineHeight: 1, background: "linear-gradient(180deg, #FFF5D0 0%, #D4AF37 35%, #B8860B 60%, #8B6914 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0 8px 40px rgba(212,175,55,0.4))", marginTop: -5 }}>
          MUNDO
        </div>
      </div>
      <div style={{ fontSize: 160, fontWeight: 900, letterSpacing: 12, background: "linear-gradient(180deg, #FFF5D0 0%, #D4AF37 30%, #B8860B 70%, #8B6914 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", opacity: yearOpacity, filter: "drop-shadow(0 4px 30px rgba(212,175,55,0.3))", transform: `translateY(${yearY}px)`, marginTop: -10 }}>
        2026
      </div>
      <div style={{ fontSize: 22, fontWeight: 500, color: "rgba(255,255,255,0.65)", letterSpacing: 14, textTransform: "uppercase", opacity: subOpacity, marginTop: 50, textShadow: "0 0 30px rgba(0,0,0,0.8)", fontFamily: "Arial, sans-serif" }}>
        El mundo se encuentra
      </div>
    </div>
  );
};

const Scene2Text: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [190, 215, 290, 300], [0, 1, 1, 0]);
  const subOpacity = interpolate(frame, [210, 235, 290, 300], [0, 1, 1, 0]);

  return (
    <div style={{ position: "absolute", bottom: "22%", left: 0, right: 0, textAlign: "center", opacity }}>
      <div style={{ fontSize: 34, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: 14, textShadow: "0 0 40px rgba(0,0,0,0.9)", fontFamily: "Arial, sans-serif" }}>
        32 NACIONES
      </div>
      <div style={{ fontSize: 20, fontWeight: 300, color: "rgba(212,175,55,0.7)", letterSpacing: 10, marginTop: 12, textShadow: "0 0 30px rgba(0,0,0,0.8)", opacity: subOpacity, fontFamily: "Arial, sans-serif" }}>
        UN SOLO CAMPEÓN
      </div>
    </div>
  );
};

const Scene3Text: React.FC<{ frame: number }> = ({ frame }) => {
  const titleScale = spring({ frame: frame - 330, fps: 30, config: { damping: 8, mass: 0.4 } });
  const titleOpacity = interpolate(frame, [330, 355, 440, 450], [0, 1, 1, 0]);
  const subOpacity = interpolate(frame, [355, 380, 440, 450], [0, 1, 1, 0]);

  return (
    <div style={{ position: "absolute", bottom: "22%", left: 0, right: 0, textAlign: "center", opacity: titleOpacity, transform: `scale(${titleScale})` }}>
      <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: 10, background: "linear-gradient(180deg, #FFF5D0 0%, #D4AF37 50%, #B8860B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0 4px 30px rgba(212,175,55,0.3))", fontFamily: "Arial, sans-serif" }}>
        LA GLORIA
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: 14, marginTop: 8, textShadow: "0 0 30px rgba(0,0,0,0.8)", opacity: subOpacity, fontFamily: "Arial, sans-serif" }}>
        ES ETERNA
      </div>
    </div>
  );
};

export const Unified3DVideo: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const cameraZ = frame < 150 ? 12 : frame < 300 ? interpolate(frame, [150, 300], [4.5, 3.8]) : 5;
  const cameraPos: [number, number, number] = frame < 300 ? [0, 0.3, cameraZ] : [0, 0.5, cameraZ];

  const titleVisible = frame < 150;
  const ballVisible = frame >= 150 && frame < 300;
  const trophyVisible = frame >= 300;

  const clearColor = frame < 300 ? 0x080810 : 0x0a0a12;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ThreeCanvas
        width={1080}
        height={1920}
        style={{ backgroundColor: "#050508" }}
        camera={{ position: cameraPos, fov: frame < 150 ? 50 : 40 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ scene, gl }) => {
          scene.add(new AmbientLight(0x444466, 0.4));
          const dl = new DirectionalLight(0xffeedd, 2.0);
          dl.position.set(5, 8, 5);
          scene.add(dl);
          const dl2 = new DirectionalLight(0x4488ff, 0.5);
          dl2.position.set(-5, 3, -5);
          scene.add(dl2);
          const pl = new PointLight(0xd4af37, 0.5);
          pl.position.set(-3, 4, 2);
          scene.add(pl);
          gl.setClearColor(clearColor, 1);
        }}
      >
        {titleVisible && <StarField frame={frame} />}
        {ballVisible && <SoccerBall frame={frame} />}
        {trophyVisible && <Trophy3D frame={frame} />}
      </ThreeCanvas>

      {titleVisible && <Scene1Title frame={frame} />}
      {ballVisible && <Scene2Text frame={frame} />}
      {trophyVisible && <Scene3Text frame={frame} />}
    </div>
  );
};
