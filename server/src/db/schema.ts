import { pgTable, serial, text, integer, date, timestamp } from 'drizzle-orm/pg-core';

export const images = pgTable('images', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  weekStart: date('week_start').notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Mon, 1=Tue, ..., 5=Sat, 6=Sun
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const terms = pgTable('terms', {
  id: serial('id').primaryKey(),
  imageId: integer('image_id').references(() => images.id, { onDelete: 'cascade' }).notNull(),
  term: text('term').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  weekStart: date('week_start').unique().notNull(),
  content: text('content').default('').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
