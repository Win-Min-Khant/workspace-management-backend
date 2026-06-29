import { Router } from "express";
import {
  protect,
  isMember,
  isOwner,
  isOwnerOrAdmin,
} from "../middlewares/protect.middleware.js";
import {
  createWorkspace,
  deleteMember,
  deleteWorkspace,
  getWorkspaceDetails,
  updateMemberRole,
  updateWorkspace,
} from "../controllers/workspace.controller.js";
import { validateWorkspaceUpdate } from "../validations/workspace.validation.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = Router({ mergeParams: true });

router.post("/", protect, createWorkspace);

router
  .route("/:workspaceId")
  .get(protect, isOwnerOrAdmin, getWorkspaceDetails)
  .patch(protect, isOwner, validateWorkspaceUpdate, validate, updateWorkspace)
  .delete(protect, isOwner, deleteWorkspace);

// router.route("/:workspaceId/members")
//   .get(protect, isMember, getWorkspaceMembers);

router
  .route("/:workspaceId/members/:memberId")
  .patch(protect, isOwner, updateMemberRole)
  .delete(protect, isOwnerOrAdmin, deleteMember);

router.post(
  "/settings",
  validateWorkspaceUpdate,
  validate,
  protect,
  isOwner,
  updateWorkspace,
);

// router.get("/:workspaceId/members", protect, isMember, getWorkspaceDetails);

export default router;
