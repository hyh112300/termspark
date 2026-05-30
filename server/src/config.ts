import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// .env 在项目根目录，不在 server/ 子目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

export const config = {
  port: parseInt(process.env.PORT!, 10),
  databaseUrl: process.env.DATABASE_URL!,
  uploadsDir: process.env.UPLOADS_DIR!,

  // JWT 配置
  jwtSecret: process.env.JWT_SECRET!,

  // 邀请码
  inviteCode: process.env.INVITE_CODE,

  // AI 服务配置 (provider: 'opencode' | 'omlx')
  aiProvider: (process.env.AI_PROVIDER) as 'opencode' | 'omlx',

  // OpenCode AI 配置
  opencodeApiKey: process.env.OPCODE_API_KEY!,
  opencodeBaseUrl: process.env.OPCODE_BASE_URL!,
  opencodeModel: process.env.OPCODE_MODEL!,

  // oMLX AI 配置
  omlxUrl: process.env.OMLX_URL || '',
  omlxModel: process.env.OMLX_MODEL || '',
  omlxApiKey: process.env.OMLX_API_KEY || '',
};
