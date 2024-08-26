import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET: Получить всех сотрудников (Employee)
router.get("/", async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        post: true,
        department: true,
        user: true,
        // orders: true,
        // routeSteps: true,
      }, // Включает связанные данные
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: "Не удалось получить сотрудников" });
  }
});

// GET by ID: Получить сотрудника по ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: Number(id) },
      include: {
        post: true,
        department: true,
        user: true,
        // orders: true,
        // routeSteps: true,
      }, // Включает связанные данные
    });

    if (!employee) {
      return res.status(404).json({ error: "Сотрудник не найден" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: "Не удалось получить сотрудника" });
  }
});

// POST: Создать нового сотрудника
router.post("/", async (req, res) => {
  const { employee_name, post_id, department_id, dismissed } = req.body;

  try {
    const newEmployee = await prisma.employee.create({
      data: {
        employee_name,
        post_id,
        department_id,
        dismissed,
      },
      include:{department:true,post:true}
    });



    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: "Не удалось создать сотрудника" });
  }
});

// PUT: Обновить информацию о сотруднике по ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { employee_name, post_id, department_id, dismissed } = req.body;

  try {
    const updatedEmployee = await prisma.employee.update({
      where: { id: Number(id) },
      data: {
        employee_name,
        post_id,
        department_id,
        dismissed,
      },
      include:{department:true,post:true}
    });

    res.json(updatedEmployee);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Не удалось обновить информацию о сотруднике" });
  }
});

// DELETE: Удалить сотрудника по ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.employee.delete({
      where: { id: Number(id) },
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Не удалось удалить сотрудника" });
  }
});

export default router;
