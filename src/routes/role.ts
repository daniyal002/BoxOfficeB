import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET: Получить все роли (Role)
router.get('/', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: { users: true }, // Включает связанных пользователей
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить роли' });
  }
});

// GET by ID: Получить роль по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
      include: { users: true }, // Включает связанных пользователей
    });

    if (!role) {
      return res.status(404).json({ error: 'Роль не найдена' });
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить роль' });
  }
});

// POST: Создать новую роль
router.post('/', async (req, res) => {
  const { role_name } = req.body;

  try {
    const newRole = await prisma.role.create({
      data: {
        role_name,
      },
    });

    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось создать роль' });
  }
});

// PUT: Обновить информацию о роли по ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { role_name } = req.body;

  try {
    const updatedRole = await prisma.role.update({
      where: { id: Number(id) },
      data: {
        role_name,
      },
    });

    res.json(updatedRole);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось обновить роль' });
  }
});

// DELETE: Удалить роль по ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.role.delete({
      where: { id: Number(id) },
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Не удалось удалить роль' });
  }
});

export default router;
