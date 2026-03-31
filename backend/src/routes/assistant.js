import express from "express";
import multer from "multer";

import { appConfig } from "../config.js";
import {
  buildInputSummary,
  generateClinicalAnalysis,
} from "../services/clinicalAssistant.js";
import { extractTextFromImage } from "../services/ocr.js";
import { transcribeAudioFile } from "../services/transcription.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Math.max(appConfig.maxAudioBytes, appConfig.maxImageBytes),
    files: 2,
  },
});

const router = express.Router();

function getFirstUploadedFile(files, fieldName) {
  const uploadedFiles = files?.[fieldName];
  return Array.isArray(uploadedFiles) ? uploadedFiles[0] : null;
}

function validateAudioFile(audioFile) {
  if (!audioFile) {
    return;
  }

  if (!audioFile.mimetype?.startsWith("audio/")) {
    const error = new Error("Audio uploads must use an audio/* content type.");
    error.statusCode = 400;
    throw error;
  }

  if (audioFile.size > appConfig.maxAudioBytes) {
    const error = new Error("Audio upload is too large for this MVP.");
    error.statusCode = 400;
    throw error;
  }
}

function validateImageFile(imageFile) {
  if (!imageFile) {
    return;
  }

  if (!imageFile.mimetype?.startsWith("image/")) {
    const error = new Error("Image uploads must use an image/* content type.");
    error.statusCode = 400;
    throw error;
  }

  if (imageFile.size > appConfig.maxImageBytes) {
    const error = new Error("Image upload is too large for this MVP.");
    error.statusCode = 400;
    throw error;
  }
}

function normalizeTextInput(value) {
  return typeof value === "string" ? value : "";
}

router.post(
  "/analyze",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const textInput = normalizeTextInput(req.body?.text);
      const audioFile = getFirstUploadedFile(req.files, "audio");
      const imageFile = getFirstUploadedFile(req.files, "image");

      validateAudioFile(audioFile);
      validateImageFile(imageFile);

      const [transcript, ocrResult] = await Promise.all([
        transcribeAudioFile(audioFile),
        extractTextFromImage(imageFile),
      ]);

      const inputSummary = buildInputSummary({
        textInput,
        transcript,
        ocrResult,
      });

      const analysis = await generateClinicalAnalysis(inputSummary);

      res.status(200).json(analysis);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
