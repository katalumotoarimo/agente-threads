import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useRef, useMemo } from "react";
import { Mesh, AmbientLight, DirectionalLight, PointLight, CanvasTexture, MeshStandardMaterial } from "three";
import { generateSoccerBallTexture } from "./SoccerBallTexture";

const BallMesh: React.FC = () => {
  const frame = useCurrentFrame();
  const meshRef = useRef<Mesh>(null);

  const texture = useMemo(() => {
    const canvas = generateSoccerBallTexture(1024);
    const tex = new CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
  }, []);

  const rotY = interpolate(frame, [0, 150], [0, Math.PI * 4]);
  const rotX = interpolate(frame, [0, 150], [0, Math.PI * 0.3]);
  const floatY = Math.sin(frame * 0.04) * 0.15;

  return (
    <mesh ref={meshRef} position={[0, floatY, 0]} rotation={[rotX, rotY, 0]}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.35}
        metalness={0.05}
        envMapIntensity={0.6}
      />
    </mesh>
  );
};

export const ThreeDBall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(frame, [0, 10, fps * 5 - 10, fps * 5], [0, 1, 1, 0]);
  const cameraZ = interpolate(frame, [0, fps * 5], [4.5, 3.8]);

  const subtitleOpacity = interpolate(frame, [40, 65, fps * 4, fps * 5 - 15], [0, 1, 1, 0]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{ opacity: sceneOpacity, width: "100%", height: "100%" }}>
        <ThreeCanvas
          width={1080}
          height={1920}
          style={{ backgroundColor: "#080810" }}
          camera={{ position: [0, 0.3, cameraZ], fov: 40 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ scene, gl }) => {
            scene.add(new AmbientLight(0x444466, 0.4));
            const dl = new DirectionalLight(0xffeedd, 1.8);
            dl.position.set(5, 8, 5);
            scene.add(dl);
            const dl2 = new DirectionalLight(0x4488ff, 0.6);
            dl2.position.set(-5, 3, -5);
            scene.add(dl2);
            const pl = new PointLight(0xd4af37, 0.5);
            pl.position.set(-3, 4, 2);
            scene.add(pl);
            const pl2 = new PointLight(0x4488ff, 0.3);
            pl2.position.set(3, -2, 4);
            scene.add(pl2);
            gl.setClearColor(0x080810, 1);
          }}
        >
          <BallMesh />
        </ThreeCanvas>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "22%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: subtitleOpacity,
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: 14,
            fontFamily: "Arial, sans-serif",
            textShadow: "0 0 40px rgba(0,0,0,0.9), 0 0 80px rgba(0,0,0,0.5)",
          }}
        >
          32 NACIONES
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 300,
            color: "rgba(212,175,55,0.7)",
            letterSpacing: 10,
            fontFamily: "Arial, sans-serif",
            marginTop: 12,
            textShadow: "0 0 30px rgba(0,0,0,0.8)",
          }}
        >
          UN SOLO CAMPEÓN
        </div>
      </div>
    </div>
  );
};
