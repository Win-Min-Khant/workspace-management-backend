import { Router } from "express";
import { protect } from "../middlewares/protect.middleware.js";
import { requireRole } from "../middlewares/protect.middleware.js";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(protect, requireRole("owner", "admin", "member"), getComments)
  .post(protect, requireRole("owner", "admin", "member"), addComment);

router
  .route("/:commentId")
  .patch(protect, requireRole("owner", "admin", "member"), updateComment)
  .delete(protect, requireRole("owner", "admin", "member"), deleteComment);

export default router;
