import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = "https://graph.threads.net/v1.0";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function uploadImage(imagePath) {
  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });

  // Convert PNG to JPEG for smaller size
  const { default: sharp } = await import("sharp");
  const jpegBuf = await sharp(imagePath).jpeg({ quality: 88 }).toBuffer();
  const tmpPath = imagePath.replace(".png", ".jpg");
  fs.writeFileSync(tmpPath, jpegBuf);

  const result = await cloudinary.uploader.upload(tmpPath, {
    resource_type: "image",
    format: "jpg",
  });

  fs.unlinkSync(tmpPath);
  console.log(`  ✓ Imagen subida: ${result.secure_url}`);
  return result.secure_url;
}

async function createAndPublish(params) {
  const { imageUrl, text } = params;

  // Step 1: Create container
  console.log("  Creando container en Threads...");
  const body = new URLSearchParams({ access_token: config.threadsToken });

  if (imageUrl) {
    body.append("media_type", "IMAGE");
    body.append("image_url", imageUrl);
    body.append("text", text);
  } else {
    body.append("media_type", "TEXT");
    body.append("text", text);
  }

  const createRes = await fetch(
    `${API_BASE}/${config.threadsUserId}/threads`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );
  const createData = await createRes.json();
  if (!createData.id) {
    throw new Error(`Error container: ${JSON.stringify(createData)}`);
  }
  console.log(`  ✓ Container ID: ${createData.id}`);

  // Step 2: Wait
  await sleep(3000);

  // Step 3: Publish
  console.log("  Publicando...");
  const pubRes = await fetch(
    `${API_BASE}/${config.threadsUserId}/threads_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        creation_id: createData.id,
        access_token: config.threadsToken,
      }),
    }
  );
  const pubData = await pubRes.json();
  if (!pubData.id) {
    throw new Error(`Error publicar: ${JSON.stringify(pubData)}`);
  }

  console.log(`  ✓ Publicado! ID: ${pubData.id}`);
  console.log(`  🔗 https://www.threads.net/@soi.elloboferoz`);

  return pubData.id;
}

export default async function postToThreads(text, imagePath) {
  console.log("\n  Publicando en Threads...");

  try {
    let imageUrl = null;

    // Upload image
    if (imagePath && fs.existsSync(imagePath)) {
      try {
        imageUrl = await uploadImage(imagePath);
      } catch (err) {
        console.log(`  ⚠ No se pudo subir imagen: ${err.message}`);
        console.log("  Publicando solo texto...");
      }
    }

    const postId = await createAndPublish({ text, imageUrl });

    // Log to history
    const postLog = path.join(__dirname, "posts", "log.json");
    const log = fs.existsSync(postLog)
      ? JSON.parse(fs.readFileSync(postLog, "utf-8"))
      : { posts: [] };
    log.posts.push({
      id: postId,
      text,
      withImage: !!imageUrl,
      publishedAt: new Date().toISOString(),
    });
    fs.writeFileSync(postLog, JSON.stringify(log, null, 2));

    return true;
  } catch (err) {
    console.error(`  ✗ ${err.message}`);
    return false;
  }
}
