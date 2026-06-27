import { Router } from "express";
import { protect, isOwnerOrAdmin } from "../middlewares/protect.middleware.js";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  manageMember,
} from "../controllers/project.controller.js";

const router = Router({ mergeParams: true });

router.post("/", protect, isOwnerOrAdmin, createProject);
router.get("/", protect, getProjects);
router.patch("/:projectId", protect, isOwnerOrAdmin, updateProject);
router.delete("/:projectId", protect, isOwnerOrAdmin, deleteProject);
router.post("/:projectId/members", protect, isOwnerOrAdmin, manageMember);

export default router;
