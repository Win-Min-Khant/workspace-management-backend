import { Router } from "express";
import {
  isMember,
  isOwner,
  isOwnerOrAdmin,
  protect,
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

const router = Router();

router.post("/create", protect, createWorkspace);
// router.post("/switch/:id", protect, switchWorkspace);
router.get("/details", protect, isOwnerOrAdmin, getWorkspaceDetails);
router.get("/:workspaceId/members", protect, isMember, getWorkspaceDetails);
router.post(
  "/settings",
  validateWorkspaceUpdate,
  validate,
  protect,
  isOwner,
  updateWorkspace,
);
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
router.delete("/delete/:id", protect, isOwner, deleteWorkspace);
export default router;
