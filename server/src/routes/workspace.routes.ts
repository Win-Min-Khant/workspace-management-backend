import { Router } from "express";
import { isOwnerOrAdmin, protect } from "../middlewares/protect.middleware.js";
import { getWorkspaceDetails } from "../controllers/workspace.controller.js";

const router = Router();

router.get("/details", protect, isOwnerOrAdmin, getWorkspaceDetails);
export default router;
