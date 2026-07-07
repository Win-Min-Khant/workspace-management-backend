import { Router } from "express";
import { protect, requireRole } from "../middlewares/protect.middleware.js";
import {
  createTask,
  deleteTask,
  getTasksByQuery,
  updateTask,
  updateTaskStatus,
} from "../controllers/task.controller.js";
import {
  createTaskValidation,
  updateTaskStatusValidation,
  updateTaskValidation,
} from "../validations/task.validation.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .post(
    protect,
    requireRole("owner", "admin"),
    createTaskValidation,
    validate,
    createTask,
  )
  .get(protect, getTasksByQuery);
router.patch(
  "/:taskId",
  protect,
  requireRole("owner", "admin"),
  updateTaskValidation,
  validate,
  updateTask,
);
router.delete("/:taskId", protect, requireRole("owner", "admin"), deleteTask);
router.patch(
  "/:taskId/status",
  protect,
  updateTaskStatusValidation,
  validate,
  updateTaskStatus,
);

export default router;
