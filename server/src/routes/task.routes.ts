import { Router } from "express";
import { protect, isOwnerOrAdmin } from "../middlewares/protect.middleware.js";
import { createTask } from "../controllers/task.controller.js";

const router = Router({ mergeParams: true });

router.post("/", protect, isOwnerOrAdmin, createTask);
// router.get("/", protect, getTasksCtrl);
// router.patch("/:taskId", protect, updateTaskCtrl);
// router.delete("/:taskId", protect, isOwnerOrAdmin, deleteTaskCtrl);
// router.patch("/:taskId/status", protect, updateMyTaskStatusCtrl);

export default router;
