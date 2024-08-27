import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET: Получить все кассы (Cash)
router.get('/', async (req, res) => {
  try {
    const cashes = await prisma.cash.findMany({
      include: { logs: true }, // Включает связанные логи
    });
    res.json(cashes);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить кассы' });
  }
});

// GET by ID: Получить кассу по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const cash = await prisma.cash.findUnique({
      where: { id: Number(id) },
      include: { logs: true }, // Включает связанные логи
    });

    if (!cash) {
      return res.status(404).json({ error: 'Касса не найдена' });
    }

    res.json(cash);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить кассу' });
  }
});

// POST: Создать новую кассу
router.post('/', async (req, res) => {
  const { cash_name, cash_summ } = req.body;

  try {
    const newCash = await prisma.cash.create({
      data: {
        cash_name,
        cash_summ,
      },
    });

    res.status(201).json(newCash);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось создать кассу' });
  }
});

// PUT: Обновить информацию о кассе по ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { cash_name, cash_summ } = req.body;

  try {
    const updatedCash = await prisma.cash.update({
      where: { id: Number(id) },
      data: {
        cash_name,
        cash_summ,
      },
    });

    res.json(updatedCash);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось обновить информацию о кассе' });
  }
});

// DELETE: Удалить кассу по ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.cash.delete({
      where: { id: Number(id) },
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Не удалось удалить кассу' });
  }
});

// POST: Внесение денежных средств
router.post('/:id/deposit', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { cash_summ } = req.body;
  const user = req.user;  


  try {
    const cash = await prisma.cash.update({
      where: { id: Number(id) },
      data: {
        cash_summ: { increment: cash_summ }, // Увеличение суммы в кассе
      },
    });

    await prisma.cashLog.create({
      data: {
        cash_id: cash.id,
        user_id: user?.userId as number,
        action: `Внесение денег: ${cash_summ}`,
      },
    });

    res.json(cash);
  } catch (error) {
    res.status(500).json({ error: `Не удалось внести средства в кассу ${error}` });
  }
});

// POST: Выдача денежных средств
router.post('/:id/withdraw', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { cash_summ } = req.body;
  const user = req.user;  

  try {
    // Находим текущую запись cash
    const cash = await prisma.cash.findUnique({
      where: { id: Number(id) },
    });

    if (!cash) {
      return res.status(404).json({ error: 'Касса не найдена' });
    }

    // Проверяем, не станет ли сумма отрицательной
    if (cash.cash_summ < cash_summ) {
      return res.status(400).json({ error: 'Недостаточно средств в кассе' });
    }

    // Выполняем обновление суммы в кассе
    const updatedCash = await prisma.cash.update({
      where: { id: Number(id) },
      data: {
        cash_summ: { decrement: cash_summ },
      },
    });

    // Логируем операцию
    await prisma.cashLog.create({
      data: {
        cash_id: updatedCash.id,
        user_id: user?.userId as number,
        action: `Выдача денег: ${cash_summ}`,
      },
    });

    res.json(updatedCash);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось выдать средства из кассы' });
  }
});


export default router;
