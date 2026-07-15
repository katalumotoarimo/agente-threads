export function generateSoccerBallTexture(size = 1024): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  ctx.fillStyle = "#F5F5F0";
  ctx.fillRect(0, 0, size, size);

  const pentR = r * 0.22;
  const centers = [
    { x: cx, y: cy - r * 0.1 },
    { x: cx - r * 0.75, y: cy - r * 0.5 },
    { x: cx + r * 0.75, y: cy - r * 0.5 },
    { x: cx - r * 0.75, y: cy + r * 0.5 },
    { x: cx + r * 0.75, y: cy + r * 0.5 },
    { x: cx, y: cy + r * 0.75 },
    { x: cx, y: cy - r * 0.75 },
    { x: cx - r * 0.4, y: cy + r * 0.65 },
    { x: cx + r * 0.4, y: cy + r * 0.65 },
    { x: cx - r * 0.4, y: cy - r * 0.65 },
    { x: cx + r * 0.4, y: cy - r * 0.65 },
    { x: cx - r * 0.9, y: cy },
    { x: cx + r * 0.9, y: cy },
  ];

  centers.forEach((c, i) => {
    const rot = (i * 37 + 18) * (Math.PI / 180);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(rot);
    ctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const angle = (j * 2 * Math.PI) / 5 - Math.PI / 2;
      const px = Math.cos(angle) * pentR;
      const py = Math.sin(angle) * pentR;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pentR);
    grad.addColorStop(0, "#3A3A3A");
    grad.addColorStop(0.6, "#2A2A2A");
    grad.addColorStop(1, "#1A1A1A");
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  });

  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1;
  for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) {
      const dx = centers[i].x - centers[j].x;
      const dy = centers[i].y - centers[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < pentR * 2.8) {
        ctx.beginPath();
        ctx.moveTo(centers[i].x, centers[i].y);
        ctx.lineTo(centers[j].x, centers[j].y);
        ctx.stroke();
      }
    }
  }

  const vignette = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.85, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);

  const highlight = ctx.createRadialGradient(cx * 0.7, cy * 0.7, 0, cx * 0.7, cy * 0.7, r * 0.8);
  highlight.addColorStop(0, "rgba(255,255,255,0.08)");
  highlight.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = highlight;
  ctx.fillRect(0, 0, size, size);

  return canvas;
}
