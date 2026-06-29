import type { Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { Task } from "../models/task.model.js";
import { AppError } from "../utils/appError.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { Types } from "mongoose";

export const addComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, taskId } = req.params;
    const { content } = req.body;
    const authorId = req.user?.userId;
    const comment = await Comment.create({
      content,
      authorId: String(authorId),
      taskId: String(taskId),
      workspaceId: String(workspaceId),
    });

    res.status(201).json({ success: true, data: comment });
  },
);

export const getComments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, taskId } = req.params;
    const userId = req.user?.userId;
    const task = await Task.findById(taskId).populate("projectId");
    // console.log(`Task - ${task}`);
    if (!task) throw new AppError(404, "Task not found");
    const isAssignee = task.assigneeId?.toString() === userId;
    const membership = await UserWorkspace.findOne({
      userId: String(userId),
      workspaceId: String(workspaceId),
    });
    if (!membership)
      throw new AppError(404, "User don't have in this workspace.");
    if (
      membership.role !== "owner" &&
      membership.role !== "admin" &&
      !isAssignee
    ) {
      throw new AppError(
        403,
        "You are not authorized to access this task's comments.",
      );
    }
    const comments = await Comment.find({ taskId: String(taskId) })
      .populate("authorId", "name avatar")
      .sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: comments });
  },
);

// PATCH /api/workspaces/:wId/tasks/:tId/comments/:cId
export const updateComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) throw new AppError(404, "Comment not found");

    if (comment.authorId.toString() !== userId) {
      throw new AppError(403, "You can only edit your own comments.");
    }

    comment.content = content;
    await comment.save();

    res.status(200).json({ success: true, data: comment });
  },
);

// DELETE /api/workspaces/:wId/tasks/:tId/comments/:cId
export const deleteComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { commentId, workspaceId, taskId } = req.params;
    const userId = req.user?.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) throw new AppError(404, "Comment not found.");

    const isAuthor = comment.authorId.toString() === userId;

    const membership = await UserWorkspace.findOne({
      userId: String(userId),
      workspaceId: String(workspaceId),
    });
    const isPrivileged =
      membership?.role === "admin" || membership?.role === "owner";

    if (!isAuthor && !isPrivileged) {
      throw new AppError(
        403,
        "You do not have permission to delete this comment.",
      );
    }

    await Comment.findByIdAndDelete(commentId);
    res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  },
);
