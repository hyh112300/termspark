import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT!, 10),
  databaseUrl: process.env.DATABASE_URL!,
  omlxUrl: process.env.oMLX_URL!,
  omlxModel: process.env.oMLX_MODEL!,
  omlxApiKey: process.env.oMLX_API_KEY!,
  uploadsDir: process.env.UPLOADS_DIR!,
};
