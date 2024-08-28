import { AuthRequest } from "../authMiddleware";

import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();


// GET-запрос для получения меню в зависимости от роли пользователя
router.get('/', async (req:AuthRequest, res) => {
  const user = req.user;

  try {
    const userRoleId = user?.roleId;
    if (!userRoleId) {
      return res.status(403).json({ error: 'Не удалось определить роль пользователя' });
    }

    const menuItems = await prisma.menu.findMany({
      where: {
        menuRoles:{
            some:{
                role_id:userRoleId
            }
        },
        // roles: {
        //   some:{
        //     id:userRoleId
        //   }
        // }
      },
      orderBy: {
        id: 'asc',
      },
    });

    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Не удалось получить меню' });
  }
});

export default router;

