import { HfInference } from "@huggingface/inference";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HF_TOKEN = process.env.HF_TOKEN;
const TOPIC = process.argv[2] || "Copa del Mundo 2026";

const hf = new HfInference(HF_TOKEN);

const scenes = [
  {
    title: "El Estadio",
    subtitle: "La fiesta del fútbol",
    prompt: `Professional photograph of a massive packed football stadium at night during the World Cup final, floodlights illuminating the pitch, thousands of fans with flags and flares, cinematic dramatic lighting, award winning sports photography, 4k ultra detailed, vibrant colors`,
  },
  {
    title: "Los Jugadores",
    subtitle: "Pasión en el campo",
    prompt: `Professional sports photograph of world class football players in action on the pitch during a World Cup match, intense moment, golden hour sunlight, motion blur effect, cinematic, national team jerseys, stadium crowd background, award winning photography, 4k`,
  },
  {
    title: "El Gol",
    subtitle: "El momento más esperado",
    prompt: `Epic photograph of a football player celebrating a goal in the World Cup final, arms raised, crowd cheering in the background, dramatic stadium lighting, emotional moment, confetti in the air, cinematic sports photography, 4k ultra detailed`,
  },
  {
    title: "La Copa",
    subtitle: "El trofeo sagrado",
    prompt: `Professional photograph of the golden FIFA World Cup trophy on a velvet pedestal, dramatic spotlight beam, dark background with bokeh lights, golden reflections, macro detail shot, cinematic lighting, award winning product photography, 4k`,
  },
  {
    title: "La Celebración",
    subtitle: "Campeones del mundo",
    prompt: `Joyful photograph of football team celebrating winning the World Cup, golden confetti falling everywhere, players hugging and jumping, stadium lights, fireworks in background, emotional victory moment, award winning sports photography, 4k ultra detailed`,
  },
];

async function generateImages() {
  const outDir = path.join(__dirname, "..", "public", "generated");
  fs.mkdirSync(outDir, { recursive: true });

  const manifest = {
    topic: TOPIC,
    generated: new Date().toISOString(),
    scenes: [],
    musicPath: null,
  };

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const filename = `scene-${i}.png`;
    const filepath = path.join(outDir, filename);

    console.log(`\n[${i + 1}/${scenes.length}] "${scene.title}"`);

    try {
      const image = await hf.textToImage({
        inputs: scene.prompt,
        model: "black-forest-labs/FLUX.1-schnell",
        parameters: { width: 1024, height: 1024 },
      });

      const buffer = Buffer.from(await image.arrayBuffer());
      fs.writeFileSync(filepath, buffer);
      console.log(`  ✓ ${filename} (${(buffer.length / 1024).toFixed(0)} KB)`);

      manifest.scenes.push({
        id: i,
        title: scene.title,
        subtitle: scene.subtitle,
        imagePath: `generated/${filename}`,
        prompt: scene.prompt,
      });
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
      process.exit(1);
    }
  }

  return manifest;
}

async function generateMusic(manifest) {
  console.log(`\n🎵 Generando música con MusicGen (AI)...`);
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs:
            "Dramatic orchestral cinematic music for sports victory, epic orchestral crescendo, inspiring powerful football anthem, grand finale",
        }),
      }
    );

    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      const musicPath = path.join(
        __dirname,
        "..",
        "public",
        "generated",
        "music.wav"
      );
      fs.writeFileSync(musicPath, buffer);
      const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);
      console.log(`  ✓ music.wav (${sizeMB} MB) - generado por AI`);
      manifest.musicPath = "generated/music.wav";
      return;
    }
    console.log(`  ⚠ MusicGen no disponible: ${response.status}`);
  } catch (err) {
    console.log(`  ⚠ AI falló: ${err.message}`);
  }

  // Fallback: música generada programáticamente
  console.log(`  Generando música sintética...`);
  const { generateMusic } = await import("./generate-music.mjs");
  const buf = generateMusic(32);
  const musicPath = path.join(__dirname, "..", "public", "generated", "music.wav");
  fs.mkdirSync(path.dirname(musicPath), { recursive: true });
  fs.writeFileSync(musicPath, buf);
  const sizeMB = (buf.length / 1024 / 1024).toFixed(1);
  console.log(`  ✓ music.wav (${sizeMB} MB) - sintética`);
  manifest.musicPath = "generated/music.wav";
}

async function main() {
  console.log("=".repeat(60));
  console.log(`  Generando assets para: "${TOPIC}"`);
  console.log("=".repeat(60));

  const manifest = await generateImages();
  await generateMusic(manifest);

  const manifestPath = path.join(
    __dirname,
    "..",
    "public",
    "generated",
    "manifest.json"
  );
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\n✓ Manifesto: public/generated/manifest.json`);
  if (manifest.musicPath) {
    console.log(`✓ Música incluida`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
