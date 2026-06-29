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

router
  .route("/")
  .post(protect, isOwnerOrAdmin, createProject)
  .get(protect, getProjects);
router
  .route("/:projectId")
  .patch(protect, isOwnerOrAdmin, updateProject)
  .delete(protect, isOwnerOrAdmin, deleteProject);
router.route("/:projectId/members").post(protect, isOwnerOrAdmin, manageMember);

export default router;
