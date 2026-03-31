import { createApp } from "./src/app.js";
import { startupValidation } from "./src/config.js";
import { shutdownOcrWorker } from "./src/services/ocr.js";

const PORT = Number(process.env.PORT) || 3022;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  if (!startupValidation.ok) {
    console.warn(`AI configuration warning: ${startupValidation.errors.join(" ")}`);
  }
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  await shutdownOcrWorker().catch((error) => {
    console.error("Failed to shut down OCR worker cleanly.", error);
  });

  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forcefully shutting down.");
    process.exit(1);
  }, 10_000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
