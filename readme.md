# MedClaim AI

## Overview
MedClaim AI helps psychiatric clinicians convert notes, audio, and images into structured billing-ready drafts with coding support and risk checks.

## Features
- Chat-style clinical draft input with text, voice recording, and image upload.
- AI-generated structured output for psychiatric billing workflows.
- CPT suggestion support and risk/safety-oriented response handling.
- Health endpoint for backend monitoring (`/health`).
- Frontend API proxy support for local development and deployment.

## Project Structure

### Backend (`backend/`)
- Node.js + Express API service.
- Main entry: `backend/server.js`.
- App setup and middleware: `backend/src/app.js`.
- Environment and AI model config: `backend/src/config.js`.
- Clinical assistant logic and schemas live in `backend/src/`.
- Test fixtures and helper scripts are in `backend/test-fixtures/` and `backend/scripts/`.

#### Backend `src/` detailed explanation

`backend/src` contains the API runtime, AI orchestration, validation schemas, and billing rule assets.

- `app.js`
  - Creates the Express app.
  - Configures security and middleware (`helmet`, `cors`, `compression`, JSON parsing).
  - Registers routes (`/api/assistant`) and health/root endpoints.
  - Centralizes 404 and error handling.

- `config.js`
  - Loads environment variables.
  - Defines app-wide runtime config (`OPENAI_API_KEY`, models, upload size limits).
  - Validates AI configuration at startup.

- `routes/assistant.js`
  - Handles `POST /api/assistant/analyze`.
  - Accepts multipart input (text + optional audio + optional image) via `multer`.
  - Validates file types/sizes.
  - Calls transcription, OCR, then clinical analysis services.

- `services/clinicalAssistant.js`
  - Core orchestration for AI analysis.
  - Builds normalized input summary from text/audio/image OCR.
  - Runs deterministic pre-analysis (patient type, controlled-substance checks).
  - Calls OpenAI Agent with strict structured output schema.
  - Normalizes and sanitizes final coding/billing output.

- `services/transcription.js`
  - Converts uploaded audio into transcript text using configured transcription model.

- `services/ocr.js`
  - Extracts text from uploaded images (OCR).
  - Returns extracted text and confidence signals for downstream warnings.

- `services/openaiClient.js`
  - Shared OpenAI client setup/utilities used by AI-facing services.

- `schemas/clinicalOutput.js`
  - Defines strict response schemas (Zod) for assistant output.
  - Ensures API responses are structurally consistent and safe for frontend rendering.

- `data/psychiatryCptLibrary.js`
  - Billing code knowledge layer.
  - Contains CPT library references and normalization helpers.
  - Supports eligibility filtering and code consistency.

- `prompts/clinicalAssistantPrompt.js`
  - Main system prompt used by the clinical AI agent.
  - Encodes strict billing behavior: CPT decision rules, risk scoring, add-on logic, structured chart format, and anti-hallucination constraints.
  - Appends psychiatry CPT prompt library content so model instructions stay centralized and version-controlled.

#### How the backend request flow works
1. Frontend sends draft data to `POST /api/assistant/analyze`.
2. `routes/assistant.js` validates payload and collects text/audio/image.
3. Audio goes through `services/transcription.js`; image goes through `services/ocr.js`.
4. `services/clinicalAssistant.js` builds a merged clinical input summary.
5. The agent runs with `prompts/clinicalAssistantPrompt.js` instructions.
6. Output is validated by `schemas/clinicalOutput.js` and normalized with `data/psychiatryCptLibrary.js`.
7. Final JSON is returned to frontend for rendering.

### Frontend (`frontend/`)
- React + Vite web application.
- Main app shell: `frontend/src/App.jsx`.
- UI components: `frontend/src/components/`.
- API helper for backend calls: `frontend/src/lib/api.js`.
- Vercel rewrite config: `frontend/vercel.json`.

## Installation and Run

### 1) Prerequisites
- Node.js 20+ recommended
- npm 10+ recommended

### 2) Clone and install dependencies
```bash
git clone https://github.com/vikasexcel/clinical-ai-assistant.git
cd clinical-ai-assistant

cd backend
npm install

cd ../frontend
npm install
```

### 3) Backend environment (`backend/.env`)
Create `backend/.env`:

```env
# Required for AI features
OPENAI_API_KEY=your_openai_api_key_here

# Optional
PORT=3022
ALLOWED_ORIGINS=http://localhost:3023
OPENAI_AGENT_MODEL=gpt-4.1-mini
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe
MAX_AUDIO_UPLOAD_MB=15
MAX_IMAGE_UPLOAD_MB=10
NODE_ENV=development
```

### 4) Frontend environment (`frontend/.env`)
Create `frontend/.env`:

```env
# Leave empty for local dev to use Vite proxy /api -> backend
VITE_API_BASE_URL=
```

If you want to call backend directly (without proxy), use:

```env
VITE_API_BASE_URL=http://localhost:3022
```

### 5) Run backend
From `backend/`:

```bash
npm run dev
```

Backend runs on `http://localhost:3022`.

### 6) Run frontend
From `frontend/`:

```bash
npm run dev
```

Frontend runs on `http://localhost:3023`.

## Quick API Check
When backend is running:

```bash
curl http://localhost:3022/health
```

Expected: JSON with `status`, `uptime`, `timestamp`, and AI configuration fields.
