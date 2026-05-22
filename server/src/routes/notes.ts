import { Router, Request, Response } from 'express';
import { db, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get note for a date
router.get('/', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'date query param required' });
      return;
    }

    const [note] = await db.select()
      .from(schema.notes)
      .where(eq(schema.notes.date, date));

    res.json(note || { date, content: '' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save note for a date
router.put('/', async (req: Request, res: Response) => {
  try {
    const { date, content } = req.body;
    if (!date) {
      res.status(400).json({ error: 'date required' });
      return;
    }

    const [note] = await db.insert(schema.notes)
      .values({ date, content: content || '' })
      .onConflictDoUpdate({
        target: schema.notes.date,
        set: { content: content || '', updatedAt: new Date() },
      })
      .returning();

    res.json(note);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
