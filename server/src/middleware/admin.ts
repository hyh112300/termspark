import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '功能暂未开放' });
  }
  next();
};
