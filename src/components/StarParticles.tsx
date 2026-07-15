import { useCurrentFrame, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useMemo, useRef } from "react";
import {
  Points,
  PointsMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  AdditiveBlending,
  AmbientLight,
  Color,
} from "three";

const ParticleField: React.FC = () => {
  const frame = useCurrentFrame();
  const pointsRef = useRef<Points>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const count = 3000;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 10 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.cos(phi) * 0.6;
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 8;

      const c = new Color().setHSL(0.1 + Math.random() * 0.08, 0.3 + Math.random() * 0.4, 0.6 + Math.random() * 0.4);
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
      sizes[i] = 0.03 + Math.random() * 0.08;
    }
    return { positions: pos, colors: cols, sizes };
  }, []);

  return (
    <points ref={pointsRef} rotation={[interpolate(frame, [0, 150], [0, 0.1]), interpolate(frame, [0, 150], [0, 0.15]), 0]}>
      <bufferGeometry>
        <float32BufferAttribute attach="attributes-position" args={[positions, 3]} />
        <float32BufferAttribute attach="attributes-color" args={[colors, 3]} />
        <float32BufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors={true}
        transparent
        opacity={0.8}
        blending={AdditiveBlending}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};

export const TitleScene3D: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1]);
  const titleScale = Math.min(1, interpolate(frame, [10, 40], [0.8, 1]));
  const yearOpacity = interpolate(frame, [25, 50], [0, 1]);
  const subOpacity = interpolate(frame, [55, 80], [0, 1]);
  const subY = interpolate(frame, [55, 80], [30, 0]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ThreeCanvas
        width={1080}
        height={1920}
        style={{ backgroundColor: "#050508" }}
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ scene, gl }) => {
          scene.add(new AmbientLight(0x222244, 0.3));
          gl.setClearColor(0x050508, 1);
        }}
      >
        <ParticleField />
      </ThreeCanvas>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.2) 0%, rgba(5,5,8,0.6) 60%, rgba(5,5,8,0.9) 100%)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: 24,
              fontFamily: "Arial, sans-serif",
              textShadow: "0 0 60px rgba(0,0,0,0.9)",
              lineHeight: 1.2,
            }}
          >
            COPA DEL
          </div>
          <div
            style={{
              fontSize: 170,
              fontWeight: 900,
              fontFamily: "Arial, sans-serif",
              letterSpacing: 20,
              lineHeight: 1,
              background: "linear-gradient(180deg, #FFF5D0 0%, #D4AF37 35%, #B8860B 60%, #8B6914 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 8px 40px rgba(212,175,55,0.4))",
              marginTop: -5,
            }}
          >
            MUNDO
          </div>
        </div>

        <div
          style={{
            fontSize: 160,
            fontWeight: 900,
            fontFamily: "Arial, sans-serif",
            letterSpacing: 12,
            background: "linear-gradient(180deg, #FFF5D0 0%, #D4AF37 30%, #B8860B 70%, #8B6914 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            opacity: yearOpacity,
            filter: "drop-shadow(0 4px 30px rgba(212,175,55,0.3))",
            marginTop: -10,
          }}
        >
          2026
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: "rgba(255,255,255,0.65)",
            letterSpacing: 14,
            fontFamily: "Arial, sans-serif",
            textTransform: "uppercase",
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            marginTop: 50,
            textShadow: "0 0 30px rgba(0,0,0,0.8)",
          }}
        >
          El mundo se encuentra
        </div>
      </div>
    </div>
  );
};
