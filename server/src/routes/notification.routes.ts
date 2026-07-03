import { Router } from "express";
import { protect } from "../middlewares/protect.middleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";

const router = Router({ mergeParams: true });

router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:notificationId/read", protect, markAsRead);

export default router;
