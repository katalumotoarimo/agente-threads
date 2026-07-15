import React, { useEffect, useState, useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  Img,
  staticFile,
  interpolate,
  Audio,
  useVideoConfig,
} from "remotion";
import { Particles } from "./Particles";

const SCENE_DURATION = 180;
const FADE = 20;

interface SceneData {
  id: number;
  title: string;
  subtitle: string;
  imagePath: string;
}

interface Manifest {
  topic: string;
  scenes: SceneData[];
  musicPath?: string;
}

const SceneLayer: React.FC<{
  scene: SceneData;
  frame: number;
  sceneStart: number;
}> = ({ scene, frame, sceneStart }) => {
  const local = frame - sceneStart;
  const { width } = useVideoConfig();

  if (local < 0 || local >= SCENE_DURATION + FADE) return null;

  let opacity: number;
  let zoomFrame: number;

  if (local < FADE) {
    opacity = local / FADE;
    zoomFrame = local;
  } else if (local < SCENE_DURATION) {
    opacity = 1;
    zoomFrame = local;
  } else {
    opacity = 1 - (local - SCENE_DURATION) / FADE;
    zoomFrame = SCENE_DURATION;
  }

  const scale = interpolate(zoomFrame, [0, SCENE_DURATION], [1, 1.15], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(zoomFrame, [0, FADE], [60, 0], {
    extrapolateRight: "clamp",
  });

  const isLastScene = local >= SCENE_DURATION + FADE - 1;

  return (
    <AbsoluteFill>
      <Img
        src={staticFile(scene.imagePath)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          opacity,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)`,
          opacity,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(255,215,0,0.05) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.4) 100%)`,
          opacity: opacity * 0.6,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 200,
          textAlign: "center",
          opacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
            padding: "80px 40px 40px",
            width: "100%",
          }}
        >
          {scene.title && (
            <h1
              style={{
                fontSize: 76,
                color: "white",
                margin: 0,
                fontWeight: 900,
                fontFamily: "Arial, sans-serif",
                letterSpacing: "0.08em",
                textShadow:
                  "0 0 30px rgba(255,215,0,0.3), 0 4px 20px rgba(0,0,0,0.9)",
              }}
            >
              {scene.title.split("").map((char, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    opacity: interpolate(
                      zoomFrame,
                      [FADE + i * 2, FADE + i * 2 + 10],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    ),
                    transform: `translateY(${interpolate(
                      zoomFrame,
                      [FADE + i * 2, FADE + i * 2 + 10],
                      [20, 0],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    )}px)`,
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
          )}
          {scene.subtitle && (
            <p
              style={{
                fontSize: 32,
                color: "#FFD700",
                margin: "16px 0 0",
                fontWeight: 600,
                fontFamily: "Arial, sans-serif",
                textShadow:
                  "0 0 20px rgba(255,215,0,0.4), 0 2px 10px rgba(0,0,0,0.8)",
                opacity: interpolate(
                  zoomFrame,
                  [FADE + scene.title.length * 2 + 15, FADE + scene.title.length * 2 + 30],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                ),
                transform: `translateY(${interpolate(
                  zoomFrame,
                  [FADE + scene.title.length * 2 + 15, FADE + scene.title.length * 2 + 30],
                  [15, 0],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                )}px)`,
              }}
            >
              {scene.subtitle}
            </p>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SceneDots: React.FC<{
  totalScenes: number;
  currentScene: number;
  frame: number;
}> = ({ totalScenes, currentScene, frame }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 120,
      }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        {Array.from({ length: totalScenes }).map((_, i) => {
          const isActive = i === currentScene;
          const isPast = i < currentScene;
          const dotOpacity = interpolate(
            frame - i * SCENE_DURATION,
            [0, FADE],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={i}
              style={{
                width: isActive ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: isActive
                  ? "#FFD700"
                  : isPast
                  ? "rgba(255,215,0,0.4)"
                  : "rgba(255,255,255,0.2)",
                opacity: isPast ? 1 : dotOpacity,
                transition: "all 0.3s",
                boxShadow: isActive
                  ? "0 0 10px rgba(255,215,0,0.6)"
                  : "none",
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const AIGeneratedVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const [manifest, setManifest] = useState<Manifest | null>(null);

  useEffect(() => {
    fetch(staticFile("generated/manifest.json"))
      .then((r) => r.json())
      .then(setManifest)
      .catch(() => {});
  }, []);

  const layers = useMemo(() => {
    if (!manifest) return null;
    const result: React.ReactNode[] = [];

    for (let i = 0; i < manifest.scenes.length; i++) {
      const sceneStart = i * SCENE_DURATION;
      const end = sceneStart + SCENE_DURATION + FADE;

      if (frame >= sceneStart - FADE && frame < end) {
        result.push(
          <SceneLayer
            key={i}
            scene={manifest.scenes[i]}
            frame={frame}
            sceneStart={sceneStart}
          />
        );
      }
    }

    return result;
  }, [frame, manifest]);

  const currentScene = manifest
    ? Math.min(Math.floor(frame / SCENE_DURATION), manifest.scenes.length - 1)
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {layers}
      {manifest && (
        <>
          <Particles />
          <SceneDots
            totalScenes={manifest.scenes.length}
            currentScene={currentScene}
            frame={frame}
          />
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, rgba(255,215,0,0.08) 0%, transparent 15%, transparent 85%, rgba(255,215,0,0.05) 100%)`,
              pointerEvents: "none",
            }}
          />
          {manifest.musicPath && (
            <Audio src={staticFile(manifest.musicPath)} volume={0.5} />
          )}
        </>
      )}
    </AbsoluteFill>
  );
};
