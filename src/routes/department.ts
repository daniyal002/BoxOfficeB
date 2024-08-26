import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET: Получить все подразделениеы (Department)
router.get('/', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: { employees: true }, // Включает связанных сотрудников
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить подразделение' });
  }
});

// GET by ID: Получить подразделение по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const department = await prisma.department.findUnique({
      where: { id: Number(id) },
      include: { employees: true }, // Включает связанных сотрудников
    });

    if (!department) {
      return res.status(404).json({ error: 'подразделение не найдено' });
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить подразделение' });
  }
});

// POST: Создать новый подразделение
router.post('/', async (req, res) => {
  const { department_name } = req.body;

  try {
    const newDepartment = await prisma.department.create({
      data: {
        department_name,
      },
    });

    res.status(201).json(newDepartment);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось создать подразделение' });
  }
});

// PUT: Обновить информацию о подразделениее по ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { department_name } = req.body;

  try {
    const updatedDepartment = await prisma.department.update({
      where: { id: Number(id) },
      data: {
        department_name,
      },
    });

    res.json(updatedDepartment);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось обновить подразделение' });
  }
});

// DELETE: Удалить подразделение по ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.department.delete({
      where: { id: Number(id) },
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Не удалось удалить подразделение' });
  }
});

export default router;
