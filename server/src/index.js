import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helpRequestsRouter from './routes/helpRequests.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// CORS: allow all in dev by default; tighten in prod
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'sapphire-platform-server' });
});

app.use('/api/help-requests', helpRequestsRouter);

// Optional: serve frontend statically if you want to host both together
// const publicDir = path.resolve(__dirname, '../../');
// app.use(express.static(publicDir));
// app.get('*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

