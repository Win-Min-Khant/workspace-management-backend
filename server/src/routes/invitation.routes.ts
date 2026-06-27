import { Router } from "express";
import { isOwnerOrAdmin, protect } from "../middlewares/protect.middleware.js";
import {
  acceptInvitation,
  sendInvitation,
} from "../controllers/invitation.controller.js";

const router = Router({ mergeParams: true });

router.post("/:workspaceId/send", protect, isOwnerOrAdmin, sendInvitation);

router.post("/accept/:token", acceptInvitation);

export default router;
