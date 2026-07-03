import { Router } from "express";
import { protect, requireRole } from "../middlewares/protect.middleware.js";
import {
  createTask,
  deleteTask,
  getTasksByQuery,
  updateTask,
  updateTaskStatus,
} from "../controllers/task.controller.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .post(protect, requireRole("owner", "admin"), createTask)
  .get(protect, getTasksByQuery);
router.patch("/:taskId", protect, requireRole("owner", "admin"), updateTask);
router.delete("/:taskId", protect, requireRole("owner", "admin"), deleteTask);
router.patch("/:taskId/status", protect, updateTaskStatus);

export default router;
