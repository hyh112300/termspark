import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { config } from './config.js';
import imageRoutes from './routes/images.js';
import termRoutes from './routes/terms.js';
import noteRoutes from './routes/notes.js';
import authRoutes from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';
import { adminOnly } from './middleware/admin.js';

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.resolve(config.uploadsDir)));

// 认证路由（无需鉴权）
app.use('/api/auth', authRoutes);

// 受保护的 API 路由（需要 JWT）
app.use('/api/images', authMiddleware, imageRoutes);
app.use('/api/terms', authMiddleware, termRoutes);
app.use('/api/notes', authMiddleware, noteRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', model: config.aiProvider === 'opencode' ? config.opencodeModel : config.omlxModel });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});

export default app;
