import { Router } from "express";
import { protect } from "../middlewares/protect.middleware.js";
import { requireRole } from "../middlewares/protect.middleware.js";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import {
  addCommentValidation,
  updateCommentValidation,
} from "../validations/comment.validation.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(protect, requireRole("owner", "admin", "member"), getComments)
  .post(
    protect,
    requireRole("owner", "admin", "member"),
    addCommentValidation,
    validate,
    addComment,
  );

router
  .route("/:commentId")
  .patch(
    protect,
    requireRole("owner", "admin", "member"),
    updateCommentValidation,
    validate,
    updateComment,
  )
  .delete(protect, requireRole("owner", "admin", "member"), deleteComment);

export default router;
