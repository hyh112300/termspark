import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { config } from '../config.js';

const router = Router();

// POST /api/auth/login - 用户登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 验证请求参数
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    // 查询用户
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user[0].passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 签发 JWT（有效期 30 天）
    const token = jwt.sign(
      { id: user[0].id, username: user[0].username, role: user[0].role },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    // 返回 token 和用户信息
    res.json({
      token,
      user: {
        id: user[0].id,
        username: user[0].username,
        role: user[0].role,
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// POST /api/auth/register - 用户注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, inviteCode } = req.body;

    // 验证邀请码
    if (inviteCode !== config.inviteCode) {
      return res.status(400).json({ error: '邀请码错误' });
    }

    // 验证请求参数
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度需在 2-20 之间' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少 6 位' });
    }

    // 检查用户名是否已存在
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: '用户名已被占用' });
    }

    // 哈希密码并创建用户
    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db.insert(users).values({
      username,
      passwordHash,
      role: 'user',
    }).returning();

    // 签发 JWT
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;