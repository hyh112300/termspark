import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { users } from './schema.js';

async function seed() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error('请设置 ADMIN_USERNAME 和 ADMIN_PASSWORD 环境变量');
    process.exit(1);
  }

  // 检查用户是否已存在
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existingUser.length > 0) {
    console.log(`用户 "${username}" 已存在，跳过创建`);
    process.exit(0);
  }

  // 哈希密码并创建用户
  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    username,
    passwordHash,
    role: 'admin',
  });

  console.log(`✓ 管理员用户 "${username}" 创建成功`);
  process.exit(0);
}

seed().catch((error) => {
  console.error('种子脚本执行失败:', error);
  process.exit(1);
});