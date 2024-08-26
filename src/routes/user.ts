import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// GET: Получить всех пользователей (User)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { employee: true, role: true, orders: true }, // Включает связанные данные
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить пользователей' });
  }
});

// GET by ID: Получить пользователя по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { employee: true, role: true, orders: true }, // Включает связанные данные
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить пользователя' });
  }
});

// POST: Создать нового пользователя
router.post('/', async (req, res) => {
  const { user_name, employee_id, password, role_id } = req.body;

  try {
    // Хеширование пароля перед сохранением
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        user_name,
        employee_id,
        password: hashedPassword,
        role_id,
      },
      include:{employee:true,role:true}
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Не удалось создать пользователя" });
  }
});

// PUT: Обновить информацию о пользователе по ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_name, employee_id, password, role_id } = req.body;

  try {
    // Если нужно изменить пароль, его также нужно захешировать
    const dataToUpdate: { user_name?: string; employee_id?: number; password?: string; role_id?: number } = {
      user_name,
      employee_id,
      role_id,
    };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      include:{employee:true,role:true}
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось обновить информацию о пользователе' });
  }
});

// DELETE: Удалить пользователя по ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Не удалось удалить пользователя' });
  }
});

export default router;
