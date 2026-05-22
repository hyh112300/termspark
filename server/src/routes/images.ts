import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { db, schema } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { generateTerms } from '../services/ai.js';
import { config } from '../config.js';

const router = Router();

// Ensure uploads directory exists
if (!fs.existsSync(config.uploadsDir)) {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: config.uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}`));
    }
  },
});

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

// Upload image & trigger AI
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const { weekStart: ws, dayOfWeek: dow } = req.body;
    const weekStart = ws || getWeekStart(new Date());
    const dayOfWeek = parseInt(dow ?? new Date().getDay().toString(), 10);

    // Read and optionally resize image for AI
    const imageBuffer = fs.readFileSync(file.path);
    const resized = await sharp(imageBuffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    const imageBase64 = resized.toString('base64');

    // Save to DB
    const [record] = await db.insert(schema.images).values({
      filename: file.filename,
      originalName: file.originalname,
      weekStart,
      dayOfWeek,
    }).returning();

    // Generate terms with AI
    let terms: string[] = [];
    try {
      terms = await generateTerms(imageBase64);
    } catch (aiErr) {
      console.error('AI generation failed:', aiErr);
      terms = []; // Graceful fallback
    }

    // Save terms
    const termRecords = [];
    for (const term of terms) {
      const [tr] = await db.insert(schema.terms).values({
        imageId: record.id,
        term,
      }).returning();
      termRecords.push(tr);
    }

    res.status(201).json({
      image: record,
      terms: termRecords,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// Get images for a week
router.get('/', async (req: Request, res: Response) => {
  try {
    const { weekStart } = req.query;
    if (!weekStart || typeof weekStart !== 'string') {
      res.status(400).json({ error: 'weekStart query param required' });
      return;
    }

    const imageRecords = await db.select()
      .from(schema.images)
      .where(eq(schema.images.weekStart, weekStart))
      .orderBy(schema.images.createdAt);

    // Fetch terms for each image
    const result = await Promise.all(
      imageRecords.map(async (img) => {
        const termRecords = await db.select()
          .from(schema.terms)
          .where(eq(schema.terms.imageId, img.id))
          .orderBy(schema.terms.createdAt);
        return { ...img, terms: termRecords };
      })
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete image
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const [record] = await db.select().from(schema.images).where(eq(schema.images.id, id));

    if (record) {
      const filePath = path.join(config.uploadsDir, record.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.delete(schema.images).where(eq(schema.images.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Regenerate terms for an image
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const [record] = await db.select().from(schema.images).where(eq(schema.images.id, id));

    if (!record) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    const filePath = path.join(config.uploadsDir, record.filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Image file not found on disk' });
      return;
    }

    const imageBuffer = fs.readFileSync(filePath);
    const resized = await sharp(imageBuffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    const imageBase64 = resized.toString('base64');

    // Delete old terms
    await db.delete(schema.terms).where(eq(schema.terms.imageId, id));

    const terms = await generateTerms(imageBase64);
    const termRecords = [];
    for (const term of terms) {
      const [tr] = await db.insert(schema.terms).values({ imageId: id, term }).returning();
      termRecords.push(tr);
    }

    res.json({ terms: termRecords });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
