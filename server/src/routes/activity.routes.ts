import { Router } from "express";
import { protect } from "../middlewares/protect.middleware.js";
import { getActivityLogs } from "../controllers/activity.controller.js";
const router = Router({ mergeParams: true });
router.get("/", protect, getActivityLogs);
export default router;
