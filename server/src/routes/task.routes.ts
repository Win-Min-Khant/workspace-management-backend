import { Router } from "express";
import { protect, isOwnerOrAdmin } from "../middlewares/protect.middleware.js";
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
  .post(protect, isOwnerOrAdmin, createTask)
  .get(protect, getTasksByQuery);
router.patch("/:taskId", protect, isOwnerOrAdmin, updateTask);
router.delete("/:taskId", protect, isOwnerOrAdmin, deleteTask);
router.patch("/:taskId/status", protect, updateTaskStatus);

export default router;
