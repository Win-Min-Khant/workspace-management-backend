import { Router } from "express";
import { protect } from "../middlewares/protect.middleware.js";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router({ mergeParams: true });

// Route: /api/workspaces/:workspaceId/tasks/:taskId/comments
router.route("/").get(protect, getComments).post(protect, addComment);

// Route: /api/workspaces/:workspaceId/tasks/:taskId/comments/:commentId
router
  .route("/:commentId")
  .patch(protect, updateComment)
  .delete(protect, deleteComment);

export default router;
