import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_jwt_secret';

// Вход пользователя
router.post('/login', async (req, res) => {
    const { user_name, password } = req.body;
  
    try {
      const user = await prisma.user.findUnique({
        where: { user_name },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Неверный пароль' });
      }
  
      const accessToken = jwt.sign({ userId: user.id, roleId: user.role_id }, JWT_SECRET, {
        expiresIn: '1h',
      });
  
      const refreshToken = jwt.sign({ userId: user.id, roleId: user.role_id }, JWT_REFRESH_SECRET, {
        expiresIn: '7d',
      });
  
      res.json({ accessToken, refreshToken });
    } catch (error) {
      res.status(500).json({ error: 'Не удалось выполнить вход' });
    }
  });

  router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
  
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token не предоставлен' });
    }
  
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: number; roleId: number };
  
      const newToken = jwt.sign({ userId: decoded.userId, roleId: decoded.roleId }, JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.json({ accessToken: newToken });
    } catch (error) {
      res.status(500).json({ error: 'Неверный refresh token' });
    }
  });

export default router;
