import { Router } from "express";
import { protect, requireRole } from "../middlewares/protect.middleware.js";
import {
  createWorkspace,
  deleteMember,
  deleteWorkspace,
  getMyWorkspaces,
  getWorkspaceDetails,
  getWorkspaceMembers,
  updateMemberRole,
  updateWorkspace,
} from "../controllers/workspace.controller.js";
import { validateWorkspaceUpdate } from "../validations/workspace.validation.js";
import { validate } from "../middlewares/validation.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router({ mergeParams: true });

router.get("/me", protect, getMyWorkspaces);

router.post("/", protect, upload.single("logo"), createWorkspace);

router
  .route("/:workspaceId")
  .get(protect, requireRole("owner"), getWorkspaceDetails)
  .patch(
    protect,
    requireRole("owner"),
    upload.single("logo"),
    validateWorkspaceUpdate,
    validate,
    updateWorkspace,
  )
  .delete(protect, requireRole("owner"), deleteWorkspace);

router
  .route("/:workspaceId/members")
  .get(protect, requireRole("owner", "admin", "member"), getWorkspaceMembers);

router
  .route("/:workspaceId/members/:memberId")
  .patch(protect, requireRole("owner"), updateMemberRole)
  .delete(protect, requireRole("owner", "admin"), deleteMember);

export default router;
