import { Router } from "express";
import { isOwnerOrAdmin, protect } from "../middlewares/protect.middleware.js";
import {
  createProject,
  deleteProject,
  getProjects,
  manageMember,
  updateProject,
} from "../controllers/project.controller.js";

const router = Router();
router.post(
  "/:workspaceId/projects/create",
  protect,
  isOwnerOrAdmin,
  createProject,
);
router.get("/:workspaceId/projects", protect, getProjects);
router.patch("/:workspaceId/projects/:projectId", protect, updateProject);
router.delete("/:workspaceId/projects/:projectId", protect, deleteProject);
router.post("/:workspaceId/projects/:projectId/members", protect, manageMember);
export default router;
