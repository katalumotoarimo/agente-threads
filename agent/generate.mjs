import { HfInference } from "@huggingface/inference";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hf = new HfInference(config.hfToken);

const QUOTES = [
  "El éxito nace de la disciplina diaria.",
  "No sueñes tu vida, vive tus sueños.",
  "Cree en ti, el resto vendrá solo.",
  "Cada caída es una lección disfrazada.",
  "La perseverancia vence al talento.",
  "Tu única competencia es tu versión de ayer.",
  "El esfuerzo de hoy es el triunfo de mañana.",
  "Lo imposible solo tarda un poco más.",
  "Las grandes cosas nacen de pequeños pasos.",
  "No esperes el momento perfecto, créalo.",
  "El límite no está afuera, está en tu mente.",
  "La actitud determina tu altitud.",
  "Cada día es una nueva oportunidad.",
  "Tu fuerza no está en caer, sino en levantarte.",
  "El cambio empieza cuando tú decides.",
  "La disciplina es el puente entre metas y logros.",
  "No hay atajo para el éxito, solo trabajo.",
  "Los sueños no tienen fecha de vencimiento.",
  "Haz hoy lo que otros no quieren, para tener mañana lo que otros no pueden.",
  "El verdadero fracaso es no intentarlo.",
  "La paciencia no es esperar, es mantener la actitud.",
  "Cada experto fue una vez un principiante.",
  "No cuentes los días, haz que los días cuenten.",
  "La distancia entre sueño y realidad se llama acción.",
  "El dolor es temporal, el orgullo es para siempre.",
];

function pickQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

async function generateQuoteWithAI() {
  const models = [
    "google/gemma-2b-it",
    "HuggingFaceH4/zephyr-7b-beta",
    "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    "microsoft/phi-2",
  ];

  for (const model of models) {
    try {
      const result = await hf.chatCompletion({
        model,
        messages: [
          {
            role: "user",
            content:
              "Generate ONE short inspirational quote in Spanish (max 15 words). Original, deep, single sentence. No explanation. Only the quote.",
          },
        ],
        max_tokens: 50,
        temperature: 0.8,
      });
      const quote = result.choices[0].message.content.trim().replace(/^["']|["']$/g, "").trim();
      if (quote && quote.length < 120) return quote;
    } catch {
      continue;
    }
  }
  return null;
}

function wrapText(text, maxCharsPerLine) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

async function generateImage(quote) {
  const outDir = path.join(__dirname, "posts");
  fs.mkdirSync(outDir, { recursive: true });

  const themes = [
    "abstract fluid art with golden light, ethereal atmosphere, deep purple and blue gradient",
    "minimalist gradient background, warm sunset colors, soft bokeh lights",
    "dreamy abstract painting style, teal and gold palette, smooth textures, elegant",
    "cosmic nebula background, deep space colors with golden dust particles, ethereal",
    "serene nature-inspired abstract, sage green and gold, organic shapes, zen atmosphere",
  ];
  const bgPrompt =
    themes[Math.floor(Math.random() * themes.length)] +
    ", motivational wallpaper, 9:16 portrait, high quality, professional, social media post";

  console.log("  Generando fondo con FLUX...");
  const bgImage = await hf.textToImage({
    inputs: bgPrompt,
    model: config.modelImg,
    parameters: { width: 1080, height: 1350 },
  });

  const bgBuffer = Buffer.from(await bgImage.arrayBuffer());

  const lines = wrapText(quote, 12);
  const fontSize = lines.length <= 2 ? 72 : 56;
  const lineHeight = fontSize * 1.5;
  const totalTextHeight = lines.length * lineHeight;
  const startY = (1350 - totalTextHeight) / 2;
  const attr = `font-family="${config.style.fontFamily}" font-size="${fontSize}" text-anchor="middle"`;

  const svgLines = lines
    .map((line, i) => {
      const y = startY + i * lineHeight + fontSize * 0.35;
      return `
        <text x="542" y="${y + 3}" ${attr} fill="rgba(0,0,0,0.6)" font-weight="bold">${line}</text>
        <text x="540" y="${y}" ${attr} fill="white" font-weight="bold">${line}</text>`;
    })
    .join("\n");

  const svg = `<svg width="1080" height="1350" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
        <stop offset="50%" stop-color="rgba(0,0,0,0)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.35)"/>
      </linearGradient>
      <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(255,215,0,0)"/>
        <stop offset="50%" stop-color="rgba(255,215,0,0.5)"/>
        <stop offset="100%" stop-color="rgba(255,215,0,0)"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="1350" fill="url(#vignette)"/>
    ${svgLines}
    <line x1="340" y1="${startY - 40}" x2="740" y2="${startY - 40}" stroke="url(#goldLine)" stroke-width="1.5"/>
    <line x1="340" y1="${startY + totalTextHeight + 40}" x2="740" y2="${startY + totalTextHeight + 40}" stroke="url(#goldLine)" stroke-width="1.5"/>
  </svg>`;

  const finalPath = path.join(outDir, "post.png");
  await sharp(bgBuffer)
    .resize(1080, 1350, { fit: "cover" })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toFile(finalPath);

  return finalPath;
}

export default async function generatePost() {
  console.log(`\n🎯 Generando contenido motivacional...`);

  console.log("  Generando frase con IA...");
  let quote = await generateQuoteWithAI();
  if (!quote) {
    quote = pickQuote();
    console.log("  (usando lista de respaldo)");
  }
  console.log(`  📝 "${quote}"`);

  console.log("  Generando imagen...");
  const imagePath = await generateImage(quote);
  const sizeKB = (fs.statSync(imagePath).size / 1024).toFixed(0);
  console.log(`  🖼 post.png (${sizeKB} KB)`);

  return { quote, imagePath };
}
