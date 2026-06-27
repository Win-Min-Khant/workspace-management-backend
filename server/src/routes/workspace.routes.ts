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

router.post("/create", protect, createWorkspace);
router.get("/details", protect, isOwnerOrAdmin, getWorkspaceDetails);
router.delete("/delete/:id", protect, isOwner, deleteWorkspace);

router.post(
  "/settings",
  validateWorkspaceUpdate,
  validate,
  protect,
  isOwner,
  updateWorkspace,
);

router.get("/:workspaceId/members", protect, isMember, getWorkspaceDetails);
router.patch(
  "/:workspaceId/members/:memberId/role",
  protect,
  isOwner,
  updateMemberRole,
);
router.delete(
  "/:workspaceId/members/:memberId",
  protect,
  isOwnerOrAdmin,
  deleteMember,
);

export default router;
