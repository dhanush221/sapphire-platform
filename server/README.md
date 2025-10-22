Sapphire Platform Server

Local development

- Prereqs: Node.js 18+, npm
- Setup:
  - cd server
  - copy .env.example to .env and adjust if needed
  - npm install
  - npx prisma generate
  - npm run prisma:migrate
  - npm run dev

The API runs on http://localhost:4000 by default.

Endpoints

- GET `/api/health` — basic health check
- POST `/api/help-requests` — create a help request
- GET `/api/help-requests` — list help requests (dev)

Frontend integration

- The frontend (index.html) can call `/api/help-requests` directly if both are on the same origin. If serving separately, enable CORS (already enabled with permissive defaults) and use absolute URLs in fetch.

