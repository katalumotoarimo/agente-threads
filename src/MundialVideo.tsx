import { AbsoluteFill, useVideoConfig, useCurrentFrame } from "remotion";
import { Unified3DVideo } from "./components/Unified3DVideo";

export const MundialVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: "#050508" }}>
      <Unified3DVideo frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};
