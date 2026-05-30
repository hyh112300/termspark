import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { db, schema } from '../db/index.js';
import { eq, and, sql, lte, gte, like, inArray, desc } from 'drizzle-orm';
import { generateTerms } from '../services/ai.js';
import { config } from '../config.js';
import { AuthRequest } from '../middleware/auth.js';

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
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function getDateWeekStart(dateStr: string): { weekStart: string; dayOfWeek: number } {
  const d = new Date(dateStr + 'T00:00:00');
  const dow = (d.getDay() + 6) % 7; // 0=Mon
  const ws = getWeekStart(d);
  return { weekStart: ws, dayOfWeek: dow };
}

// Helper to attach terms to image records
async function attachTerms(images: any[]): Promise<any[]> {
  return Promise.all(
    images.map(async (img) => {
      const termRecords = await db.select()
        .from(schema.terms)
        .where(eq(schema.terms.imageId, img.id))
        .orderBy(schema.terms.createdAt);
      return { ...img, terms: termRecords };
    })
  );
}

/* ════════════════════════════════════════════
   Upload image & trigger AI
   Now accepts `date` instead of weekStart+dayOfWeek
   ════════════════════════════════════════════ */
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const { user } = req as AuthRequest;
    const { date: dateParam } = req.body;
    const dateStr = dateParam || new Date().toISOString().split('T')[0];
    const { weekStart, dayOfWeek } = getDateWeekStart(dateStr);

    const imageBuffer = fs.readFileSync(file.path);
    const resized = await sharp(imageBuffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    const imageBase64 = resized.toString('base64');

    const [record] = await db.insert(schema.images).values({
      userId: user!.id,
      filename: file.filename,
      originalName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      weekStart,
      dayOfWeek,
    }).returning();

    let terms: string[] = [];
    try {
      terms = await generateTerms(imageBase64);
      console.log('AI terms generated:', terms.length, 'terms');
    } catch (aiErr) {
      console.error('AI generation failed:', aiErr);
    }

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

/* ════════════════════════════════════════════
   [NEW] Timeline — paginated, centered on a date
   ════════════════════════════════════════════ */
router.get('/timeline', async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthRequest;
    const { around, before, after, limit: limitStr } = req.query;
    const limit = Math.min(parseInt(limitStr as string) || 14, 56);

    if (before && typeof before === 'string') {
      // Load images with weekStart < before's weekStart
      const { weekStart: beforeWs } = getDateWeekStart(before);
      const imageRecords = await db.select()
        .from(schema.images)
        .where(and(eq(schema.images.userId, user!.id), lte(schema.images.weekStart, beforeWs)))
        .orderBy(desc(schema.images.weekStart), desc(schema.images.createdAt))
        .limit(limit + 1);

      const hasMore = imageRecords.length > limit;
      const items = await attachTerms(imageRecords.slice(0, limit));
      const nextCursor = items.length > 0
        ? items[items.length - 1].weekStart
        : null;

      res.json({ items, hasMore, nextCursor });
      return;
    }

    if (after && typeof after === 'string') {
      // Load images with weekStart > after's weekStart
      const { weekStart: afterWs } = getDateWeekStart(after);
      const imageRecords = await db.select()
        .from(schema.images)
        .where(and(eq(schema.images.userId, user!.id), gte(schema.images.weekStart, afterWs)))
        .orderBy(desc(schema.images.weekStart), desc(schema.images.createdAt))
        .limit(limit + 1);

      const hasMore = imageRecords.length > limit;
      const items = await attachTerms(imageRecords.slice(0, limit));
      const nextCursor = items.length > 0
        ? items[0].weekStart
        : null;

      res.json({ items, hasMore, nextCursor });
      return;
    }

    // Default: load around a specific date
    const aroundDate = (around as string) || new Date().toISOString().split('T')[0];
    const { weekStart: centerWs } = getDateWeekStart(aroundDate);

    // Load past (before centerWs)
    const pastRecords = await db.select()
      .from(schema.images)
      .where(and(eq(schema.images.userId, user!.id), lte(schema.images.weekStart, centerWs)))
      .orderBy(desc(schema.images.weekStart), desc(schema.images.createdAt))
      .limit(limit + 1);

    // Load future (after centerWs)
    const futureRecords = await db.select()
      .from(schema.images)
      .where(and(eq(schema.images.userId, user!.id), gte(schema.images.weekStart, centerWs)))
      .orderBy(desc(schema.images.weekStart), desc(schema.images.createdAt))
      .limit(limit + 1);

    // Combine: past + center + future, deduplicate
    const seen = new Set<number>();
    const combined = [...pastRecords, ...futureRecords].filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    const hasMorePast = pastRecords.length > limit;
    const hasMoreFuture = futureRecords.length > limit;
    const items = await attachTerms(combined);
    const pastCursor = pastRecords.length > 0
      ? pastRecords[pastRecords.length - 1].weekStart
      : null;
    const futureCursor = futureRecords.length > 0
      ? futureRecords[0].weekStart
      : null;

    res.json({
      items,
      hasMorePast,
      hasMoreFuture,
      pastCursor,
      futureCursor,
    });
  } catch (err: any) {
    console.error('Timeline error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ════════════════════════════════════════════
   [NEW] Search images by term
   ════════════════════════════════════════════ */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthRequest;
    const { q, limit: limitStr } = req.query;
    const searchQuery = (q as string) || '';
    const limit = Math.min(parseInt(limitStr as string) || 20, 100);

    if (!searchQuery.trim()) {
      res.json({ items: [], total: 0 });
      return;
    }

    // Find image IDs that have matching terms (限当前用户)
    const matchingTermImages = await db.select({ imageId: schema.terms.imageId })
      .from(schema.terms)
      .innerJoin(schema.images, eq(schema.terms.imageId, schema.images.id))
      .where(and(
        sql`${schema.terms.term} ILIKE ${'%' + searchQuery + '%'}`,
        eq(schema.images.userId, user!.id),
      ))
      .groupBy(schema.terms.imageId)
      .limit(limit);

    if (matchingTermImages.length === 0) {
      res.json({ items: [], total: 0 });
      return;
    }

    const imageIds = matchingTermImages.map(t => t.imageId);
    const records = await db.select()
      .from(schema.images)
      .where(inArray(schema.images.id, imageIds))
      .orderBy(schema.images.createdAt);

    const items = await attachTerms(records);

    res.json({ items, total: items.length });
  } catch (err: any) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete image
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthRequest;
    const id = parseInt(req.params.id as string, 10);
    const [record] = await db.select().from(schema.images).where(
      and(eq(schema.images.id, id), eq(schema.images.userId, user!.id))
    );

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
    const { user } = req as AuthRequest;
    const id = parseInt(req.params.id as string, 10);
    const [record] = await db.select().from(schema.images).where(
      and(eq(schema.images.id, id), eq(schema.images.userId, user!.id))
    );

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
