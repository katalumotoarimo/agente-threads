import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

const PARTICLE_COUNT = 60;

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  wobbleFreq: number;
  wobbleAmp: number;
  hue: number;
  sat: number;
  light: number;
  baseOpacity: number;
  delay: number;
}

export const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const particles = useMemo<Particle[]>(() => {
    const seed = 42;
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: ((seed * (i + 1) * 1.7) % 1),
      y: ((seed * (i + 1) * 3.1) % 1),
      size: 1.5 + ((seed * (i + 1) * 7.3) % 5),
      speed: 0.15 + ((seed * (i + 1) * 11.7) % 0.4),
      wobbleFreq: 0.005 + ((seed * (i + 1) * 13.1) % 0.015),
      wobbleAmp: 15 + ((seed * (i + 1) * 17.3) % 40),
      hue: 30 + ((seed * (i + 1) * 23.7) % 30),
      sat: 60 + ((seed * (i + 1) * 29.3) % 40),
      light: 50 + ((seed * (i + 1) * 37.7) % 30),
      baseOpacity: 0.15 + ((seed * (i + 1) * 43.1) % 0.4),
      delay: ((seed * (i + 1) * 53.7) % 900),
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      const adjustedFrame = Math.max(0, frame - p.delay);
      const yPos =
        ((p.y * height - adjustedFrame * p.speed * height * 0.01) %
          (height + 100)) +
        50;
      if (yPos < -50 || yPos > height + 50) continue;

      const wobble =
        Math.sin(adjustedFrame * p.wobbleFreq + p.x * 10) * p.wobbleAmp;
      const xPos = Math.max(
        0,
        Math.min(width, p.x * width + wobble)
      );

      const fadeIn = Math.min(1, adjustedFrame / 60);
      const nearEdge = Math.min(1, Math.min(xPos, width - xPos, yPos, height - yPos) / 100);
      const opacity = p.baseOpacity * fadeIn * Math.min(1, nearEdge * 3);

      if (opacity < 0.01) continue;

      ctx.beginPath();
      ctx.arc(xPos, yPos, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${opacity})`;

      const glowSize = p.size * 3;
      const glow = ctx.createRadialGradient(
        xPos,
        yPos,
        0,
        xPos,
        yPos,
        glowSize
      );
      glow.addColorStop(
        0,
        `hsla(${p.hue}, ${p.sat}%, ${p.light + 20}%, ${opacity * 0.3})`
      );
      glow.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0)`);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(xPos, yPos, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light + 30}%, ${opacity * 0.8})`;
      ctx.fill();
    }
  }, [frame, width, height, particles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
};
