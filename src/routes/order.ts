import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { findMinValue } from "../helper/searchMin";
import { AuthRequest } from "../authMiddleware";
import upload from "../middleware/upload";
import path from "path";
import fs from "fs";

const router = Router();
const prisma = new PrismaClient();
const FINISHED_STEP_ID = null;

// get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        employee: true,
        user: true,
        route: true,
        status: true,
        routeStep: true,
        images: true,
      },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении заказов" });
  }
});

router.get("/user", async (req: AuthRequest, res) => {
  const user = req.user;

  try {
    const orders = await prisma.order.findMany({
      where: { user_id: Number(user?.userId) },
      include: {
        employee: true,
        user: true,
        route: true,
        status: true,
        routeStep: true,
        images: true,
      },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении заказов" });
  }
});

// получение заявок для согласования
router.get("/approval", async (req: AuthRequest, res) => {
  const user = req.user;

  try {
    const employee = await prisma.user.findUnique({
      where: { id: Number(user?.userId) },
      include: { employee: true },
    });

    if (!employee || !employee.employee) {
      return res.status(404).json({ error: "Сотрудник не найден" });
    }

    const routeSteps = await prisma.routeStep.findMany({
      where: { employee_id: employee?.employee_id },
    });

    const orders = await prisma.order.findMany({
      where: {
        current_route_step_id: {
          in: routeSteps.map((step) => step.id),
        },
      },
      include: {
        employee: true,
        user: true,
        route: true,
        status: true,
        routeStep: true,
        images: true,
      },
    });

    if (!orders) {
      res.json({ message: "Нет заявок для согласования" });
    }

    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Ошибка при получении заявки` });
  }
});

// get order by id
router.get("/:id?", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        employee: true,
        user: true,
        route: true,
        status: true,
        routeStep: true,
        images: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }

    res.json(order);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Ошибка при получении заявки` });
  }
});

// Create a new order
router.post("/", async (req: AuthRequest, res) => {
  const { order_description, order_summ, route_id, order_note } = req.body;
  const user = req.user;

  try {
    const route = await prisma.route.findUnique({
      where: { id: Number(route_id) },
      include: { steps: true },
    });

    let initialStepId: number | undefined;

    if (route && route.steps.length > 0) {
      // Ищем минимальный step_number в шаге маршрута
      const minStepId = findMinValue(route.steps, "step_number");

      // Проверяем, существует ли шаг с таким step_number
      const initialStep = route.steps.find(
        (step) => step.step_number === minStepId
      );
      if (initialStep) {
        initialStepId = initialStep.id; // Устанавливаем id шага
      }
    }

    const employee = await prisma.user.findUnique({
      where: { id: Number(user?.userId) },
    });
    const status = await prisma.status.findFirst({
      where: { orderStatus: "PENDING" },
    });

    const order = await prisma.order.create({
      data: {
        employee_id: employee?.employee_id as number,
        user_id: user?.userId as number,
        order_description,
        order_summ: parseFloat(order_summ), // Убедитесь, что значение передается как число
        route_id,
        status_id: status?.id as number, // Initial status
        order_note,
        current_route_step_id: initialStepId, // Устанавливаем, если шаг найден
      },
      include: { employee: true, status: true, images: true, route: true },
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: `Ошибка при создании заявки` });
  }
});

// Update order
router.put("/:id", async (req: AuthRequest, res) => {
  const { order_description, order_summ, order_note } = req.body;
  const { id } = req.params;
  const user = req.user;

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        employee: true,
        user: true,
        route: true,
        status: true,
        routeStep: true,
        images: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }

    if (order.user_id !== user?.userId) {
      return res.status(403).json({ error: "Нет доступа к изменению заявки" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        user_id: user?.userId as number,
        order_description,
        order_summ: parseFloat(order_summ),
        order_note,
      },
      include: { employee: true, status: true, images: true, route: true },
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при создании заявки" });
  }
});

// Delete order
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { images: true }, // Включаем существующие изображения
    });
    if (!order) {
      return res.status(404).json({ error: "Заказ не найден" });
    }
    const WITHDRAWStatus = await prisma.status.findFirst({
      where: { orderStatus: "WITHDRAW" }, // или любое другое значение по умолчанию
    });
    if (order.status_id === WITHDRAWStatus?.id ) {
      return res.status(403).json({ error: "Нет доступа к удалению заявки" });
    }
    // Сначала удаляем связанные изображения
    if (order?.images?.length > 0) {
      for (const image of order.images) {
        const filePath = path.join(__dirname, "../..", image.image_src);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Удаляем файл
        }
      }
      await prisma.orderImage.deleteMany({
        where: { order_id: order.id },
      });
    }

    // Затем удаляем сам order
    await prisma.order.delete({
      where: { id: Number(id) },
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: `Не удалось удалить заявку: ${error}` });
  }
});

router.post("/:id/agreed", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    let updateOrder;
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { route: { include: { steps: true } } },
    });

    if (!order) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }


    const employee = await prisma.user.findUnique({
      where: { id: Number(user?.userId) },
      include: { employee: true },
    });
    const currentStep = order.route.steps.find(
      (step) => step.id === order.current_route_step_id
    );
    if (currentStep !== null && currentStep !== undefined) {
      if (currentStep?.employee_id !== employee?.employee_id) {
        return res.status(403).json({ error: "Нет доступа к этой заявке" });
      }
    }else{
      if (employee?.employee_id !== employee?.employee_id) {
        return res.status(403).json({ error: "Нет доступа к этой заявке" });
      }
    }

    let message = "";

    if (currentStep === null || currentStep === undefined) {
      let initialStepId: number | undefined;
      const minNumber = findMinValue(order.route.steps, "step_number");
      const initialStep = order.route.steps.find(
        (step) => step.step_number === minNumber
      );
      if (initialStep) {
        initialStepId = initialStep.id;
      }
      const defaultStatus = await prisma.status.findFirst({
        where: { orderStatus: "PENDING" }, // или любое другое значение по умолчанию
      });
      updateOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          current_route_step_id: initialStepId,
          status_id: defaultStatus?.id,
        },
        include: { employee: true, status: true, images: true, route: true },
      });
      message = `Заявка перешела к первому шагу`;
    } else {
      let nextStepNumber = currentStep?.step_number_agreed;
      let nextStepStatus = currentStep?.status_id_agreed;
      if (nextStepNumber == 0 || nextStepNumber === null) {
        updateOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            current_route_step_id: FINISHED_STEP_ID,
            status_id: nextStepStatus,
          },
          include: { employee: true, status: true, images: true, route: true },
        });
        message = `Заявка завершена`;
      } else {
        let stepId = order.route.steps.find(
          (step) => step.step_number === nextStepNumber
        );
        updateOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            current_route_step_id: stepId?.id,
            status_id: nextStepStatus,
          },
          include: { employee: true, status: true, images: true, route: true },
        });

        const nextEmployee = await prisma.routeStep.findFirst({
          where: { route_id: order.route_id, step_number: nextStepNumber },
          include: { employee: true },
        });
        message = `Заявка перешела от ${employee?.employee.employee_name} к следующему шагу: ${nextStepNumber} - ${nextEmployee?.employee.employee_name}`;
      }
    }

    // Record approval history
    await prisma.approvalHistory.create({
      data: {
        order_id: order.id,
        message: message,
      },
    });

    res.json(updateOrder);
  } catch (error) {
    res
      .status(500)
      .json({
        error: `Не удалось перенести заявку на следующий шаг`,
      });
  }
});

// Proceed to the back step in the route
router.post("/:id/rejected", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { messageB } = req.body;
  const user = req.user;

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { route: { include: { steps: true } } },
    });

    if (!order) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }


    if (order.current_route_step_id === FINISHED_STEP_ID) {
      return res
        .status(500)
        .json({ error: "Заявка была завершена, невозможно ее отклонить !" });
    }

    const currentStep = order.route.steps.find(
      (step) => step.id === order.current_route_step_id
    );

    const employee = await prisma.user.findUnique({
      where: { id: Number(user?.userId) },
      include: { employee: true },
    });

    if (currentStep?.employee_id !== employee?.employee_id) {
      return res.status(403).json({ error: "Нет доступа к этой заявке" });
    }

    let backStepNumber = currentStep?.step_number_rejected || FINISHED_STEP_ID;
    let backStepStatus = currentStep?.status_id_rejected;
    let message = "";

    if (backStepNumber == 0 || backStepNumber === null) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          current_route_step_id: FINISHED_STEP_ID,
          status_id: backStepStatus,
        },
      });
      message = `Заявка отклонена сотрудником ${employee?.employee.employee_name} и завершена по причине: ${messageB}`;
    } else {
      let stepId = order.route.steps.find(
        (step) => step.step_number === backStepNumber
      );
      await prisma.order.update({
        where: { id: order.id },
        data: {
          current_route_step_id: stepId?.id,
          status_id: backStepStatus,
        },
      });

      const backEmployee = await prisma.routeStep.findFirst({
        where: { route_id: order.route_id, step_number: backStepNumber },
        include: { employee: true },
      });
      message = `Заявка отклонена сотрудником ${employee?.employee.employee_name} и перешла на следующий шаг: ${backStepNumber} - ${backEmployee?.employee.employee_name} по причине: ${messageB}`;
    }

    // Record rejection history
    await prisma.approvalHistory.create({
      data: {
        order_id: order.id,
        message: message,
      },
    });

    res.json({
      message: `Заявка отклонена на предыдущий шаг с причиной: ${messageB}`,
    });
  } catch (error) {
    res.status(500).json({ error: `Не удалось отклонить заявку` });
  }
});

// Proceed to reset the route
router.post("/:id/reset", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { route: { include: { steps: true } } },
    });

    if (!order) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }

    const defaultStatus = await prisma.status.findFirst({
      where: { orderStatus: "PENDING" }, // или любое другое значение по умолчанию
    });
    await prisma.order.update({
      where: { id: order.id },
      data: {
        current_route_step_id: null,
        route_id: undefined,
        status_id: defaultStatus?.id,
      },
    });


    // Record reset history
    await prisma.approvalHistory.create({
      data: {
        order_id: order.id,
        message: "Заявка сброшена",
      },
    });

    res.json({ message: "Заявка сброшена" });
  } catch (error) {
    res.status(500).json({ error: "Не удалось сбросить заявку"});
  }
});

// POST: Загрузка и привязка фотографий к заказу
router.post(
  "/:id/images",
  upload.array("images", 10),
  async (req: AuthRequest, res) => {
    const { id } = req.params;

    try {
      const order = await prisma.order.findUnique({
        where: { id: Number(id) },
      });

      if (!order) {
        return res.status(404).json({ error: "Заказ не найден" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Файлы не были загружены" });
      }

      const imageRecords = (req.files as Express.Multer.File[]).map((file) => ({
        order_id: order.id,
        image_src: file.path,
      }));

      const newImages = await prisma.orderImage.createMany({
        data: imageRecords,
      });

      res
        .status(201)
        .json({
          message: "Файлы успешно загружены",
          count: newImages.count,
        });
    } catch (error) {
      res.status(500).json({ error: "Ошибка при добавлении файлов" });
    }
  }
);

// PUT: Обновить фотографии заказа по ID
router.put(
  "/:id/images",
  upload.array("images", 10),
  async (req: AuthRequest, res) => {
    const { id } = req.params;

    try {
      const order = await prisma.order.findUnique({
        where: { id: Number(id) },
        include: { images: true }, // Включаем существующие изображения
      });

      if (!order) {
        return res.status(404).json({ error: "Заказ не найден" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Файлы не были загружены" });
      }

      // Удаление старых изображений из файловой системы и базы данных
      if (order.images.length > 0) {
        for (const image of order.images) {
          const filePath = path.join(__dirname, "../..", image.image_src);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Удаляем файл
          }
        }
        await prisma.orderImage.deleteMany({
          where: { order_id: order.id },
        });
      }

      // Сохранение новых изображений
      const imageRecords = (req.files as Express.Multer.File[]).map((file) => ({
        order_id: order.id,
        image_src: file.path,
      }));

      const newImages = await prisma.orderImage.createMany({
        data: imageRecords,
      });

      res
        .status(201)
        .json({
          message: "Файлы успешно обновлены",
          count: newImages.count,
        });
    } catch (error) {
      res.status(500).json({ error: "Ошибка при обновлении файла" });
    }
  }
);
export default router;
