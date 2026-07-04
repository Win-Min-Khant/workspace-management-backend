import { Router } from "express";
import { protect, requireRole } from "../middlewares/protect.middleware.js";
import { getActivityLogs } from "../controllers/activity.controller.js";
const router = Router({ mergeParams: true });
router.get("/", protect, requireRole("owner", "admin"), getActivityLogs);
export default router;
