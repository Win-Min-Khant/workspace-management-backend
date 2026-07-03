import { Router } from "express";
import { protect, requireRole } from "../middlewares/protect.middleware.js";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  manageMember,
} from "../controllers/project.controller.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .post(protect, requireRole("owner", "admin"), createProject)
  .get(protect, getProjects);
router
  .route("/:projectId")
  .patch(protect, requireRole("owner", "admin"), updateProject)
  .delete(protect, requireRole("owner", "admin"), deleteProject);
router
  .route("/:projectId/members")
  .post(protect, requireRole("owner", "admin"), manageMember);

export default router;
