import { Router } from "express";
import { isOwnerOrAdmin, protect } from "../middlewares/protect.middleware.js";
import {
  acceptInvitation,
  sendInvitation,
} from "../controllers/invitation.controller.js";

const router = Router({ mergeParams: true });

router
  .route("/:workspaceId/send")
  .post(protect, isOwnerOrAdmin, sendInvitation);
router.route("/accept/:token").post(acceptInvitation);

export default router;
