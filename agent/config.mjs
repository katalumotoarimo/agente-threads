export default {
  hfToken: process.env.HF_TOKEN,
  threadsToken: process.env.THREADS_TOKEN,
  threadsUserId: process.env.THREADS_USER_ID,
  schedule: "0 */6 * * *",
  locale: "es-AR",
  modelImg: "black-forest-labs/FLUX.1-schnell",
  modelText: "mistralai/Mistral-7B-Instruct-v0.3",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  style: {
    palette: ["#0f0c29", "#302b63", "#24243e"],
    accentColor: "#FFD700",
    fontFamily: "Georgia, serif",
    posterSize: { width: 1080, height: 1350 },
  },
};
