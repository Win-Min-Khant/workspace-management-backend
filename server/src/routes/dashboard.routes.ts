import { Router } from "express";
import { protect } from "../middlewares/protect.middleware.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

const router = Router({ mergeParams: true });

// Route: /api/workspaces/:workspaceId/dashboard
router.get("/", protect, getDashboard);

export default router;
