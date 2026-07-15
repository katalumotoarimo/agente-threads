import { HfInference } from "@huggingface/inference";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HF_TOKEN = process.env.HF_TOKEN;
const THREADS_TOKEN = process.env.THREADS_TOKEN;
const THREADS_USER_ID = process.env.THREADS_USER_ID;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!HF_TOKEN || !THREADS_TOKEN || !THREADS_USER_ID) {
  console.error("Faltan variables de entorno");
  process.exit(1);
}

const hf = new HfInference(HF_TOKEN);

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

const THEMES = [
  "abstract fluid art with golden light, ethereal atmosphere, deep purple and blue gradient",
  "minimalist gradient background, warm sunset colors, soft bokeh lights",
  "dreamy abstract painting style, teal and gold palette, smooth textures, elegant",
  "cosmic nebula background, deep space colors with golden dust particles, ethereal",
  "serene nature-inspired abstract, sage green and gold, organic shapes, zen atmosphere",
];

function wrapText(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length <= maxChars) {
      line += (line ? " " : "") + w;
    } else {
      if (line) lines.push(line.trim());
      line = w;
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

async function generateImage(quote) {
  const bgPrompt =
    THEMES[Math.floor(Math.random() * THEMES.length)] +
    ", motivational wallpaper, 9:16 portrait, high quality, social media post";

  console.log("Generando fondo con FLUX...");
  const bgImage = await hf.textToImage({
    inputs: bgPrompt,
    model: "black-forest-labs/FLUX.1-schnell",
    parameters: { width: 1080, height: 1350 },
  });
  const bgBuffer = Buffer.from(await bgImage.arrayBuffer());

  const lines = wrapText(quote, 12);
  const fontSize = lines.length <= 2 ? 72 : 56;
  const lineHeight = fontSize * 1.5;
  const totalH = lines.length * lineHeight;
  const startY = (1350 - totalH) / 2;
  const attr = `font-family="Georgia, serif" font-size="${fontSize}" text-anchor="middle"`;

  const svgLines = lines
    .map((l, i) => {
      const y = startY + i * lineHeight + fontSize * 0.35;
      return `
        <text x="542" y="${y + 3}" ${attr} fill="rgba(0,0,0,0.6)" font-weight="bold">${l}</text>
        <text x="540" y="${y}" ${attr} fill="white" font-weight="bold">${l}</text>`;
    })
    .join("\n");

  const svg = `<svg width="1080" height="1350">
    <defs>
      <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
        <stop offset="50%" stop-color="rgba(0,0,0,0)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.35)"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="1350" fill="url(#v)"/>
    ${svgLines}
  </svg>`;

  const pngPath = path.join(__dirname, "post.png");
  await sharp(bgBuffer).resize(1080, 1350, { fit: "cover" }).composite([{ input: Buffer.from(svg) }]).png().toFile(pngPath);

  const jpgPath = pngPath.replace(".png", ".jpg");
  await sharp(pngPath).jpeg({ quality: 88 }).toFile(jpgPath);
  fs.unlinkSync(pngPath);
  return jpgPath;
}

async function postToThreads(quote, imagePath) {
  console.log("Subiendo a Cloudinary...");
  const upload = await cloudinary.uploader.upload(imagePath, { resource_type: "image" });
  const imageUrl = upload.secure_url;
  console.log("URL:", imageUrl);

  console.log("Creando container en Threads...");
  const body = new URLSearchParams({ media_type: "IMAGE", image_url: imageUrl, text: quote, access_token: THREADS_TOKEN });
  const r1 = await fetch(`https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const d1 = await r1.json();
  if (!d1.id) throw new Error(`Container: ${JSON.stringify(d1)}`);
  console.log("Container ID:", d1.id);

  await new Promise((r) => setTimeout(r, 3000));

  console.log("Publicando...");
  const r2 = await fetch(`https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ creation_id: d1.id, access_token: THREADS_TOKEN }),
  });
  const d2 = await r2.json();
  if (!d2.id) throw new Error(`Publish: ${JSON.stringify(d2)}`);
  console.log("Publicado! ID:", d2.id);
  console.log("https://www.threads.net/@soi.elloboferoz");

  fs.unlinkSync(imagePath);
}

const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
console.log("Frase:", quote);

const imagePath = await generateImage(quote);
await postToThreads(quote, imagePath);
console.log("✅ Listo.");
