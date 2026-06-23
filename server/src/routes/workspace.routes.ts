import { Router } from "express";
import {
  isOwner,
  isOwnerOrAdmin,
  protect,
} from "../middlewares/protect.middleware.js";
import {
  getWorkspaceDetails,
  updateWorkspace,
} from "../controllers/workspace.controller.js";
import { validateWorkspaceUpdate } from "../validations/workspace.validation.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = Router();

router.get("/details", protect, isOwnerOrAdmin, getWorkspaceDetails);
router.post(
  "/settings",
  validateWorkspaceUpdate,
  validate,
  protect,
  isOwner,
  updateWorkspace,
);
export default router;
