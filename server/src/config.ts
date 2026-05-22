import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/termspark',
  omlxUrl: process.env.oMLX_URL || 'http://127.0.0.1:8000/v1',
  omlxModel: process.env.oMLX_MODEL || 'gemma-4-e4b-it-8bit',
  uploadsDir: process.env.UPLOADS_DIR || './uploads',
};
