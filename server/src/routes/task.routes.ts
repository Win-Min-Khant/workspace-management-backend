import { Router } from "express";
import { protect, isOwnerOrAdmin } from "../middlewares/protect.middleware.js";
import {
  createTask,
  getAllTasks,
  updateTask,
} from "../controllers/task.controller.js";

const router = Router({ mergeParams: true });

router.post("/", protect, isOwnerOrAdmin, createTask);
router.get("/", protect, getAllTasks);
router.patch("/:taskId", protect, isOwnerOrAdmin, updateTask);
// router.delete("/:taskId", protect, isOwnerOrAdmin, deleteTaskCtrl);
// router.patch("/:taskId/status", protect, updateMyTaskStatusCtrl);

export default router;
