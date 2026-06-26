import { Router } from "express";
import { isOwnerOrAdmin, protect } from "../middlewares/protect.middleware.js";
import {
  createProject,
  getProjects,
} from "../controllers/project.controller.js";

const router = Router();
router.post(
  "/:workspaceId/projects/create",
  protect,
  isOwnerOrAdmin,
  createProject,
);
router.get("/:workspaceId/projects", protect, getProjects);
export default router;
