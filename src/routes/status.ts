import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET: Получить все статусы (Status)
router.get('/', async (req, res) => {
  try {
    const statuses = await prisma.status.findMany({
      include: { orders: true, agreedSteps: true, rejectedSteps: true }, // Включает связанные данные
    });
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить статусы' + error });
  }
});

// GET by ID: Получить статус по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const status = await prisma.status.findUnique({
      where: { id: Number(id) },
      include: { orders: true, agreedSteps: true, rejectedSteps: true }, // Включает связанные данные
    });

    if (!status) {
      return res.status(404).json({ error: 'Статус не найден' });
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить статус' });
  }
});

// POST: Создать новый статус
router.post('/', async (req, res) => {
  const { status_name,orderStatus } = req.body;

  try {
    const newStatus = await prisma.status.create({
      data: {
        status_name,
        orderStatus
      },
    });

    res.status(201).json(newStatus);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось создать статус' });
  }
});

// PUT: Обновить информацию о статусе по ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status_name,orderStatus } = req.body;

  try {
    const updatedStatus = await prisma.status.update({
      where: { id: Number(id) },
      data: {
        status_name,
        orderStatus
      },
    });

    res.json(updatedStatus);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось обновить статус' });
  }
});

// DELETE: Удалить статус по ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.status.delete({
      where: { id: Number(id) },
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Не удалось удалить статус' });
  }
});

export default router;
