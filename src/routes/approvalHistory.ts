import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

router.get("/:orderId", async (req, res) => {
  const { orderId } = req.params;
  if (!orderId) {
    return res.status(400).json({ message: "Не найдена заявка по id" });
  }
  try {
    const approvalHistory = await prisma.approvalHistory.findMany({
      where: {
        order_id: Number(orderId),
      },
      orderBy: {
        created_at: "asc", // Сортируем по дате создания
      },
    });

    if (approvalHistory.length === 0) {
      return res
        .status(404)
        .json({ message: "История согласования для этого заказа не найдена" });
    }

    res.status(200).json(approvalHistory);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении заказа" });
  }
});


export default router