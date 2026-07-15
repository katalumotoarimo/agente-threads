import cron from "node-cron";
import generatePost from "./generate.mjs";
import postToThreads from "./publish.mjs";
import config from "./config.mjs";

let running = false;

async function runCycle() {
  if (running) {
    console.log("  ⏳ Ciclo anterior todavía en ejecución, saltando...");
    return;
  }
  running = true;

  console.log("\n" + "=".repeat(60));
  console.log("  🤖 AGENTE AUTÓNOMO — Publicando en Threads");
  console.log("  " + new Date().toLocaleString("es-AR"));
  console.log("=".repeat(60));

  try {
    const { quote, imagePath } = await generatePost();
    const success = await postToThreads(quote, imagePath);
    if (success) {
      console.log("\n✅ Publicado exitosamente.");
    } else {
      console.log("\n⚠️  Falló. Reintentando en el próximo ciclo...");
    }
  } catch (err) {
    console.error("\n💥 Error:", err.message);
  }

  running = false;
}

console.log(`
╔══════════════════════════════════════════════════╗
║     🤖  AGENTE AUTÓNOMO THREADS                ║
║     Cuenta: @soi.elloboferoz                    ║
║     Contenido: Frases motivacionales            ║
║                                                 ║
║     Modo: AUTOMÁTICO                            ║
║     Publica cada 6 horas                        ║
║     Sin intervención humana                     ║
╚══════════════════════════════════════════════════╝
`);

// Primer post en 15 segundos
setTimeout(async () => {
  await runCycle();
  // Programar siguientes cada 6 horas
  cron.schedule("0 */6 * * *", runCycle);
  console.log("⏰ Próximo post en 6 horas.");
}, 15000);
