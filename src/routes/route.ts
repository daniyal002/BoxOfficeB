import { Router } from 'express';
import { PrismaClient,Prisma } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET: Получить все маршруты (Route)
router.get('/', async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: { steps: {include:{employee:true,statusAgreed:true,statusRejected:true}}, orders: true }, // Включает связанные шаги и заказы
    });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить маршруты' });
  }
});

// GET by ID: Получить маршрут по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const route = await prisma.route.findUnique({
      where: { id: Number(id) },
      include: { steps: true, orders: true }, // Включает связанные шаги и заказы
    });

    if (!route) {
      return res.status(404).json({ error: 'Маршрут не найден' });
    }

    res.json(route);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить маршрут' });
  }
});

// POST: Создать новый маршрут вместе с шагами
router.post('/', async (req, res) => {
  const { route_name, steps } = req.body;

  try {
    // Удаляем поле route_id из каждого шага, так как оно будет автоматически присвоено Prisma
    const sanitizedSteps = steps.map((step:any) => {
      const { route_id, id, ...rest } = step; // Убираем route_id и id, если вы хотите использовать автоинкрементируемый идентификатор.
      return rest;
    });

    const newRoute = await prisma.route.create({
      data: {
        route_name,
        steps: {
          create: sanitizedSteps, // Создаем и связываем шаги маршрута
        },
      },
      include: { steps: true },
    });

    res.status(201).json(newRoute);
  } catch (error) {
    res.status(500).json({ error: `Не удалось создать маршрут`, });
  }
});

// PUT: Обновить маршрут по ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { route_name, steps } = req.body;

  try {

    const sanitizedSteps = steps.map((step:any) => {
      const { route_id, id, ...rest } = step; // Убираем route_id и id, если вы хотите использовать автоинкрементируемый идентификатор.
      return rest;
    });

    const updatedRoute = await prisma.route.update({
      where: { id: Number(id) },
      data: {
        route_name,
        steps: {
          deleteMany: {}, // Удаляем все предыдущие шаги
          create: sanitizedSteps,  // Добавляем новые шаги
        },
      },
      include: { steps: true },
    });

    res.json(updatedRoute);
  } catch (error) {
    res.status(500).json({ error: `Не удалось обновить маршрут` });
  }
});

// DELETE: Удалить маршрут по ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Сначала удаляем все шаги, связанные с маршрутом
    await prisma.routeStep.deleteMany({
      where: { route_id: Number(id) },
    });

    // Затем удаляем сам маршрут
    await prisma.route.delete({
      where: { id: Number(id) },
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Не удалось удалить маршрут' });
  }
});


export default router;
