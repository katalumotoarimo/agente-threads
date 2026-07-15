import { HfInference } from "@huggingface/inference";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hf = new HfInference(config.hfToken);

const QUOTES = [
  { quote: "El éxito nace de la disciplina diaria.", reflection: "No se trata de hacer grandes cosas de vez en cuando, sino de hacer las pequeñas cosas todos los días. Eso es lo que realmente construye el éxito." },
  { quote: "No sueñes tu vida, vive tus sueños.", reflection: "Soñar es el primer paso, pero vivir ese sueño requiere acción. ¿Qué puedes hacer hoy para acercarte un paso más?" },
  { quote: "Cree en ti, el resto vendrá solo.", reflection: "La confianza en uno mismo es el motor que enciende todo lo demás. Cuando crees que puedes, ya recorriste la mitad del camino." },
  { quote: "Cada caída es una lección disfrazada.", reflection: "Tropezar no es fracasar. Es la vida enseñándote algo que solo se aprende cayendo. Levántate, sacude el polvo y sigue." },
  { quote: "La perseverancia vence al talento.", reflection: "El talento te abre puertas, pero la perseverancia es la que te mantiene adentro. No pares." },
  { quote: "Tu única competencia es tu versión de ayer.", reflection: "No te compares con los demás. Compite con quien fuiste ayer. La única meta real es ser mejor que antes." },
  { quote: "El esfuerzo de hoy es el triunfo de mañana.", reflection: "Cada hora de trabajo, cada sacrificio, cada noche sin dormir vale la pena. El resultado aún no lo ves, pero está en camino." },
  { quote: "Lo imposible solo tarda un poco más.", reflection: "Todo lo que hoy parece normal alguna vez fue imposible. Date tiempo." },
  { quote: "Las grandes cosas nacen de pequeños pasos.", reflection: "Un gran viaje se hace paso a paso. No subestimes el poder de avanzar un poco cada día." },
  { quote: "No esperes el momento perfecto, créalo.", reflection: "El momento perfecto no existe. Se construye con decisión y acción. Deja de esperar y empieza hoy." },
  { quote: "El límite no está afuera, está en tu mente.", reflection: "Siempre nos decimos 'no puedo' antes de intentarlo. Pregúntate: ¿es realmente imposible o solo miedo?" },
  { quote: "La actitud determina tu altitud.", reflection: "No siempre puedes controlar lo que te pasa, pero sí cómo reaccionas. Una buena actitud lo cambia todo." },
  { quote: "Cada día es una nueva oportunidad.", reflection: "El pasado no se cambia, pero cada amanecer trae una hoja en blanco. Escuchá lo que el día tiene para decirte." },
  { quote: "Tu fuerza no está en caer, sino en levantarte.", reflection: "No importa cuántas veces caigas. Importa cuántas veces encuentres la fuerza para volver a levantarte." },
  { quote: "El cambio empieza cuando tú decides.", reflection: "Nadie va a cambiar tu vida por vos. El primer paso, el más difícil, solo lo podés dar vos." },
  { quote: "La disciplina es el puente entre metas y logros.", reflection: "Las metas son sueños con fecha. La disciplina es el vehículo que te lleva de donde estás a donde querés estar." },
  { quote: "No hay atajo para el éxito, solo trabajo.", reflection: "Todo camino real hacia el éxito está pavimentado con trabajo constante. No hay fórmulas mágicas, solo constancia." },
  { quote: "Los sueños no tienen fecha de vencimiento.", reflection: "Nunca es tarde para empezar algo nuevo. Tus sueños siguen ahí, esperando que los retomes." },
  { quote: "Haz hoy lo que otros no quieren, para tener mañana lo que otros no pueden.", reflection: "El sacrificio de hoy es la libertad de mañana. Mientras otros descansan, vos construís tu futuro." },
  { quote: "El verdadero fracaso es no intentarlo.", reflection: "No intentar por miedo al fracaso es el único fracaso real. Intentalo. Peor sería preguntarse '¿y si lo hubiera intentado?'" },
  { quote: "La paciencia no es esperar, es mantener la actitud.", reflection: "Paciencia no es pasividad. Es seguir con fe mientras las cosas toman su tiempo." },
  { quote: "Cada experto fue una vez un principiante.", reflection: "Nadie nace sabiendo. Detrás de cada experto hay horas de práctica, errores y perseverancia." },
  { quote: "No cuentes los días, haz que los días cuenten.", reflection: "No se trata de sobrevivir la semana esperando el fin de semana. Se trata de encontrar propósito en cada día." },
  { quote: "La distancia entre sueño y realidad se llama acción.", reflection: "Pensar no basta. Planear no basta. Solo la acción convierte lo imaginado en real." },
  { quote: "El dolor es temporal, el orgullo es para siempre.", reflection: "Lo que duele hoy será tu orgullo mañana. Dale la bienvenida al esfuerzo porque te está forjando." },
];

function pickQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  return { quote: q.quote, reflection: q.reflection };
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
  let quote, reflection;
  const aiResult = await generateQuoteWithAI();
  if (aiResult) {
    quote = aiResult;
    reflection = aiResult;
  } else {
    const fallback = pickQuote();
    quote = fallback.quote;
    reflection = fallback.reflection;
    console.log("  (usando lista de respaldo)");
  }
  console.log(`  📝 "${quote}"`);

  console.log("  Generando imagen...");
  const imagePath = await generateImage(quote);
  const sizeKB = (fs.statSync(imagePath).size / 1024).toFixed(0);
  console.log(`  🖼 post.png (${sizeKB} KB)`);

  return { quote, reflection, imagePath };
}
