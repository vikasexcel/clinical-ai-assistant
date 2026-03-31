## Learned User Preferences

- Prefer JavaScript over TypeScript for the Node/Express backend in this project.
- Prefer ESM (`import`/`export` and `"type": "module"`) over CommonJS for backend code.
- When tightening CORS, include explicit HTTP methods, `credentials: true`, and trusted origins such as `http://localhost:3022` alongside any comma-separated `ALLOWED_ORIGINS` list.

## Learned Workspace Facts

- The Express API listens on port **3022** by default (`PORT` env); a JSON health check is exposed at `GET /health`.
- The Vite dev server for the React frontend runs on port **3023** (`vite --port 3023` in `frontend` scripts).
- In local dev, leaving `VITE_API_BASE_URL` empty makes the browser call same-origin `/api/...` so the Vite proxy can forward to the backend without duplicating path segments like `/api/api/...`.
- The clinical UI is a Tailwind v4 chat layout (thread + composer); the main shell uses a flex column with a scrollable message region and a composer that is not `position: fixed`, so messages and controls do not overlap.
