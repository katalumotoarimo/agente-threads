import { Composition } from "remotion";
import { MundialVideo } from "./MundialVideo";
import { AIGeneratedVideo } from "./components/AIGeneratedVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Mundial"
        component={MundialVideo}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="AIVideo"
        component={AIGeneratedVideo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
