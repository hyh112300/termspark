import { Router, Request, Response } from 'express';
import { db, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get note for a week
router.get('/', async (req: Request, res: Response) => {
  try {
    const { weekStart } = req.query;
    if (!weekStart || typeof weekStart !== 'string') {
      res.status(400).json({ error: 'weekStart query param required' });
      return;
    }

    const [note] = await db.select()
      .from(schema.notes)
      .where(eq(schema.notes.weekStart, weekStart));

    res.json(note || { weekStart, content: '' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save note for a week
router.put('/', async (req: Request, res: Response) => {
  try {
    const { weekStart, content } = req.body;
    if (!weekStart) {
      res.status(400).json({ error: 'weekStart required' });
      return;
    }

    const [note] = await db.insert(schema.notes)
      .values({ weekStart, content: content || '' })
      .onConflictDoUpdate({
        target: schema.notes.weekStart,
        set: { content: content || '', updatedAt: new Date() },
      })
      .returning();

    res.json(note);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
