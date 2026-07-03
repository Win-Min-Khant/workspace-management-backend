import { Router } from "express";
import { protect, requireRole } from "../middlewares/protect.middleware.js";
import {
  acceptInvitation,
  sendInvitation,
  verifyInvitation,
} from "../controllers/invitation.controller.js";

const router = Router({ mergeParams: true });

router
  .route("/:workspaceId/send")
  .post(protect, requireRole("owner", "admin"), sendInvitation);
router.route("/accept/:token").post(acceptInvitation);
router.get("/verify/:token", verifyInvitation);

export default router;
