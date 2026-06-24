import { Router } from "express";
import { isOwner, protect } from "../middlewares/protect.middleware.js";
import { sendInvitation } from "../controllers/invitation.controller.js";

const router = Router();
router.post("/send", protect, isOwner, sendInvitation);
export default router;
