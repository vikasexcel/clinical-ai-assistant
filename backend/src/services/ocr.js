import { createWorker } from "tesseract.js";

let workerPromise;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng");
  }

  return workerPromise;
}

export async function extractTextFromImage(imageFile) {
  if (!imageFile) {
    return null;
  }

  const worker = await getWorker();
  const {
    data: { confidence, text },
  } = await worker.recognize(imageFile.buffer);

  return {
    text: text.trim(),
    confidence,
  };
}

export async function shutdownOcrWorker() {
  if (!workerPromise) {
    return;
  }

  const worker = await workerPromise;
  workerPromise = undefined;
  await worker.terminate();
}
