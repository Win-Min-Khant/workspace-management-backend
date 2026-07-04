import type { Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { CommentService } from "../services/comment.service.js";

// @route POST | /api/workspaces/:workspaceId/tasks/:taskId/comments
// @desc Add a comment to a task
// @access Private (Owner/Admin/Member)
export const addComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, taskId } = req.params;
    const { content } = req.body;
    const authorId = req.user?.userId as string;

    if (!authorId) throw new AppError(401, "Unauthorized.");

    const comment = await CommentService.addComment(
      content,
      authorId,
      taskId as string,
      workspaceId as string,
    );

    res.status(201).json({ success: true, data: comment });
  },
);

// @route GET | /api/workspaces/:workspaceId/tasks/:taskId/comments
// @desc Get all comments on a task
// @access Private (Owner/Admin/Assignee)
export const getComments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, taskId } = req.params;
    const userId = req.user?.userId as string;

    if (!userId) throw new AppError(401, "Unauthorized.");

    const comments = await CommentService.getComments(
      taskId as string,
      workspaceId as string,
      userId,
    );

    res
      .status(200)
      .json({ success: true, count: comments.length, data: comments });
  },
);

// @route PATCH | /api/workspaces/:workspaceId/tasks/:taskId/comments/:commentId
// @desc Update a comment
// @access Private (Author only)
export const updateComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { commentId, taskId, workspaceId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId as string;

    if (!userId) throw new AppError(401, "Unauthorized.");

    const comment = await CommentService.updateComment(
      commentId as string,
      userId,
      content,
      taskId as string,
      workspaceId as string,
    );

    res.status(200).json({ success: true, data: comment });
  },
);

// @route DELETE | /api/workspaces/:workspaceId/tasks/:taskId/comments/:commentId
// @desc Delete a comment
// @access Private (Author/Owner/Admin)
export const deleteComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { commentId, workspaceId, taskId } = req.params;
    const userId = req.user?.userId as string;

    if (!userId) throw new AppError(401, "Unauthorized.");

    const result = await CommentService.deleteComment(
      commentId as string,
      userId,
      workspaceId as string,
      taskId as string,
    );

    res.status(200).json({ success: true, data: result });
  },
);
