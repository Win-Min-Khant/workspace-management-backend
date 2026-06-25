import { Router } from "express";
import {
  isOwner,
  isOwnerOrAdmin,
  protect,
} from "../middlewares/protect.middleware.js";
import {
  acceptInvitation,
  sendInvitation,
} from "../controllers/invitation.controller.js";

const router = Router();
router.post("/:workspaceId/send", protect, isOwnerOrAdmin, sendInvitation);
router.post("/accept/:token", protect, acceptInvitation);
export default router;
