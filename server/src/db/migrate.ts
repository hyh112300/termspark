/**
 * TermSpark data migration script
 * 
 * Migrates notes table from week_start-based schema to date-based schema.
 * 
 * Usage: pnpm run db:migrate
 */

import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  console.log('Connected to database');

  try {
    // Step 1: Backup notes table
    console.log('Step 1: Backing up notes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes_backup AS SELECT * FROM notes;
    `);

    // Step 2: Add date column if not exists
    console.log('Step 2: Adding date column...');
    await client.query(`
      ALTER TABLE notes ADD COLUMN IF NOT EXISTS date DATE;
    `);

    // Step 3: Migrate existing week_start data to date
    console.log('Step 3: Migrating week_start → date...');
    await client.query(`
      UPDATE notes SET date = week_start WHERE date IS NULL;
    `);

    // Step 4: Add unique constraint on date
    console.log('Step 4: Adding unique constraint on date...');
    await client.query(`
      ALTER TABLE notes ADD CONSTRAINT notes_date_unique UNIQUE (date);
    `);

    // Step 5: Verify migration
    const { rows } = await client.query(`
      SELECT COUNT(*) as count, 
             COUNT(CASE WHEN date IS NULL THEN 1 END) as null_dates 
      FROM notes
    `);
    console.log(`Migration complete: ${rows[0].count} rows, ${rows[0].null_dates} null dates`);

  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate()
  .then(() => {
    console.log('Migration finished successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration error:', err);
    process.exit(1);
  });
