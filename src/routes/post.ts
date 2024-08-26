import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET: Получить все должности (Post)
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { employees: true }, // Включает связанных сотрудников
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить должности' });
  }
});

// GET by ID: Получить должность по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: { employees: true }, // Включает связанных сотрудников
    });

    if (!post) {
      return res.status(404).json({ error: 'Должность не найдена' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить должность' });
  }
});

// POST: Создать новую должность
router.post('/', async (req, res) => {
  const { post_name } = req.body;

  try {
    const newPost = await prisma.post.create({
      data: {
        post_name,
      },
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось создать должность' });
  }
});

// PUT: Обновить информацию о должности по ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { post_name } = req.body;

  try {
    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        post_name,
      },
    });

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось обновить должность' });
  }
});

// DELETE: Удалить должность по ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.post.delete({
      where: { id: Number(id) },
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Не удалось удалить должность' });
  }
});

export default router;
