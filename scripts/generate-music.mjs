import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function generateMusic(durationSec = 32, sampleRate = 44100) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const numChannels = 1;
  const bitsPerSample = 16;
  const dataSize = numSamples * (bitsPerSample / 8) * numChannels;
  const headerSize = 44;

  const buf = Buffer.alloc(headerSize + dataSize);

  // WAV header
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE((sampleRate * bitsPerSample * numChannels) / 8, 28);
  buf.writeUInt16LE((bitsPerSample * numChannels) / 8, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);

  // Frequencies: F2 (87.3), C3 (130.8), F3 (174.6), A3 (220), C4 (261.6), F4 (349.2)
  const layers = [
    { freq: 87.3, gain: 0.35, attack: 0, release: 0 },
    { freq: 130.8, gain: 0.2, attack: 0.1, release: 0.05 },
    { freq: 174.6, gain: 0.15, attack: 0.2, release: 0.1 },
    { freq: 261.6, gain: 0.06, attack: 0.35, release: 0.15 },
    { freq: 349.2, gain: 0.04, attack: 0.45, release: 0.2 },
    { freq: 523.3, gain: 0.015, attack: 0.5, release: 0.25 },
  ];

  // Add a slow pulse/rhythm (heartbeat-like)
  const bpm = 65;
  const beatDuration = 60 / bpm;
  const pulseFreq = 1 / beatDuration;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = i / numSamples;

    // Master envelope: slow attack, slight dip, crescendo to end
    const masterEnv = Math.min(
      1,
      (() => {
        const attack = Math.min(1, t / 4);
        const dip = 1 - Math.sin(t * Math.PI * 0.15) * 0.1 * Math.max(0, 1 - progress * 2);
        const crescendo = 0.4 + progress * 0.6;
        return attack * dip * crescendo;
      })()
    );

    // Pads
    let sample = 0;
    for (const layer of layers) {
      const layerEnv = Math.min(
        1,
        Math.max(0, (t - layer.attack) / 1.5)
      ) * Math.min(1, Math.max(0, (durationSec - t - layer.release) / 0.5));
      const detune = 0.99 + Math.sin(t * 0.3 + layer.freq * 0.01) * 0.01;
      sample +=
        Math.sin(2 * Math.PI * layer.freq * t * detune) * layer.gain * layerEnv;
    }

    // Slow LFO for movement
    const lfo = 0.7 + Math.sin(2 * Math.PI * 0.08 * t) * 0.3;

    // Pulse (sub bass thump on each beat)
    const pulsePhase = (t * pulseFreq) % 1;
    const pulse = Math.max(0, Math.sin(pulsePhase * Math.PI * 2));
    const pulseEnv = Math.max(0, 1 - pulsePhase * 8) * 0.08;

    // High shimmer with slow random
    const shimmer =
      Math.sin(2 * Math.PI * 1397 * t + Math.sin(t * 0.5) * 2) * 0.008 +
      Math.sin(2 * Math.PI * 1760 * t + Math.sin(t * 0.3) * 3) * 0.005;

    // White noise for texture (very subtle)
    const noise = (Math.random() - 0.5) * 0.006;

    // Combine
    let value =
      sample * masterEnv * lfo + pulse * masterEnv + shimmer + noise;

    // Soft clip for warmth
    value = Math.tanh(value * 1.5) * 0.8;

    const intSample = Math.max(
      -32768,
      Math.min(32767, Math.round(value * 32767))
    );
    buf.writeInt16LE(intSample, headerSize + i * 2);
  }

  return buf;
}

// Run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outDir = path.join(__dirname, "..", "public", "generated");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "music.wav");
  const buf = generateMusic(32);
  fs.writeFileSync(outPath, buf);
  console.log(
    `✓ Música generada: ${outPath} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`
  );
}
