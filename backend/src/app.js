import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import multer from "multer";

import { startupValidation } from "./config.js";
import assistantRouter from "./routes/assistant.js";

export function createApp() {
  const app = express();
  const allowedOrigins = [
    ...(process.env.ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []),
    "https://medclaim-ai.vercel.app",
  ];

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: [...new Set(allowedOrigins)],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: startupValidation.ok ? "ok" : "degraded",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      aiConfigured: startupValidation.ok,
      errors: startupValidation.errors,
    });
  });

  app.get("/", (req, res) => {
    res.status(200).json({
      message: "Clinical assistant backend running",
      aiConfigured: startupValidation.ok,
    });
  });

  app.use("/api/assistant", assistantRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    }

    if (res.headersSent) {
      return next(err);
    }

    if (!err.statusCode || err.statusCode >= 500) {
      console.error(err);
    }

    return res.status(err.statusCode || 500).json({
      error: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
    });
  });

  return app;
}
