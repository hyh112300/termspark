import { Router, Request, Response } from 'express';
import { db, schema } from '../db/index.js';
import { and, eq } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get note for a date
router.get('/', async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthRequest;
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'date query param required' });
      return;
    }

    const [note] = await db.select()
      .from(schema.notes)
      .where(and(eq(schema.notes.userId, user!.id), eq(schema.notes.date, date)));

    res.json(note || { date, content: '' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save note for a date
router.put('/', async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthRequest;
    const { date, content } = req.body;
    if (!date) {
      res.status(400).json({ error: 'date required' });
      return;
    }

    // 查找是否已有该用户该日期的便签
    const [existing] = await db.select()
      .from(schema.notes)
      .where(and(eq(schema.notes.userId, user!.id), eq(schema.notes.date, date)));

    let note;
    if (existing) {
      // 更新
      [note] = await db.update(schema.notes)
        .set({ content: content || '', updatedAt: new Date() })
        .where(and(eq(schema.notes.userId, user!.id), eq(schema.notes.date, date)))
        .returning();
    } else {
      // 创建
      [note] = await db.insert(schema.notes)
        .values({ userId: user!.id, date, content: content || '' })
        .returning();
    }

    res.json(note);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
