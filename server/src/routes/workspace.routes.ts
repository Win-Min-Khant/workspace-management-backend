import { Router } from "express";
import {
  isOwner,
  isOwnerOrAdmin,
  protect,
} from "../middlewares/protect.middleware.js";
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspaceDetails,
  switchWorkspace,
  updateWorkspace,
} from "../controllers/workspace.controller.js";
import { validateWorkspaceUpdate } from "../validations/workspace.validation.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = Router();

router.post("/create", protect, createWorkspace);
router.post("/switch/:id", protect, switchWorkspace);
router.get("/details", protect, isOwnerOrAdmin, getWorkspaceDetails);
router.post(
  "/settings",
  validateWorkspaceUpdate,
  validate,
  protect,
  isOwner,
  updateWorkspace,
);
router.delete("/delete/:id", protect, isOwner, deleteWorkspace);
export default router;
