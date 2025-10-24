import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helpRequestsRouter from './routes/helpRequests.js';
import tasksRouter from './routes/tasks.js';
import deadlinesRouter from './routes/deadlines.js';
import subtasksRouter from './routes/subtasks.js';
import { scheduleReminderJob } from '../jobs/reminders.js';
import { authFromHeaders } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(authFromHeaders);

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
app.use('/tasks', tasksRouter);
app.use('/deadlines', deadlinesRouter);
app.use('/', subtasksRouter);

// Serve frontend statically (same origin) for easier integration
const publicDir = path.resolve(__dirname, '../../frontend');
app.use(express.static(publicDir));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  scheduleReminderJob();
});
