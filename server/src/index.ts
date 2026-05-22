import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { config } from './config.js';
import imageRoutes from './routes/images.js';
import termRoutes from './routes/terms.js';
import noteRoutes from './routes/notes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.resolve(config.uploadsDir)));

// API routes
app.use('/api/images', imageRoutes);
app.use('/api/terms', termRoutes);
app.use('/api/notes', noteRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', model: config.omlxModel });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});

export default app;
