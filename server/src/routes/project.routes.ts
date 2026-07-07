import { Router } from "express";
import { protect, requireRole } from "../middlewares/protect.middleware.js";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  manageMember,
  getProjectDetails,
} from "../controllers/project.controller.js";
import {
  createProjectValidation,
  getProjectsValidation,
  updateProjectValidation,
} from "../validations/project.validation.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .post(
    protect,
    requireRole("owner", "admin"),
    createProjectValidation,
    validate,
    createProject,
  );
router.get(
  "/",
  protect,
  requireRole("owner", "admin", "member"),
  getProjectsValidation,
  validate,
  getProjects,
);
router
  .route("/:projectId")
  .get(protect, requireRole("owner", "admin", "member"), getProjectDetails)
  .patch(
    protect,
    requireRole("owner", "admin"),
    updateProjectValidation,
    validate,
    updateProject,
  )
  .delete(protect, requireRole("owner"), deleteProject);
router
  .route("/:projectId/members")
  .post(protect, requireRole("owner", "admin"), manageMember);

export default router;
