import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.join(__dirname, "..");

const TOPIC = process.argv[2] || "Copa del Mundo 2026";
const OUTPUT = process.argv[3] || "out/mundial-ai.mp4";

console.log("=".repeat(60));
console.log("  Pipeline IA: Generar video de 30s sobre:");
console.log(`  "${TOPIC}"`);
console.log("=".repeat(60));

// Step 1: Generate assets
console.log("\n[1/2] Generando imágenes con IA...");
execSync(`node scripts/generate-assets.mjs "${TOPIC}"`, {
  cwd: projectDir,
  stdio: "inherit",
  shell: "powershell",
});

// Step 2: Render video
console.log("\n[2/2] Renderizando video Remotion...");
execSync(
  `npx remotion render src/index.ts AIVideo "${OUTPUT}" --timeout=120000`,
  {
    cwd: projectDir,
    stdio: "inherit",
    shell: "powershell",
  }
);

console.log("\n" + "=".repeat(60));
console.log(`  ✓ Video listo: ${OUTPUT}`);
console.log("=".repeat(60));
