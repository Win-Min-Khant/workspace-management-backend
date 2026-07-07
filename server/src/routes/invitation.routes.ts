import { Router } from "express";
import { protect, requireRole } from "../middlewares/protect.middleware.js";
import {
  acceptInvitation,
  sendInvitation,
  verifyInvitation,
} from "../controllers/invitation.controller.js";
import {
  acceptInvitationValidation,
  sendInvitationValidation,
} from "../validations/invitation.validation.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = Router({ mergeParams: true });

router
  .route("/:workspaceId/invite")
  .post(
    protect,
    requireRole("owner", "admin"),
    sendInvitationValidation,
    validate,
    sendInvitation,
  );
router.post(
  "/accept/:token",
  acceptInvitationValidation,
  validate,
  acceptInvitation,
);
router.get("/verify/:token", verifyInvitation);

export default router;
