import type { NextFunction, Response } from "express";
import { Task } from "../models/task.model.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { AppError } from "../utils/appError.js";
import type { AuthRequest } from "./protect.middleware.js";

// Check taskId does have in Task collection or not
// Check user does have in workspace
// Check taskOwnerId is the same with the auth user
// Check auth user's role is admin or owner
export const authorizeTaskAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { workspaceId, taskId } = req.params;
  const userId = req.user?.userId;
  const task = await Task.findById(taskId);
  if (!task) throw new AppError(404, "Task not found");
  const membership = await UserWorkspace.findOne({
    userId: String(userId),
    workspaceId: String(workspaceId),
  });
  if (!membership)
    throw new AppError(404, "User don't have in this workspace.");
  const isAssignee = task?.assigneeId?.toString() === userId;
  const isPrivileged =
    membership?.role === "owner" || membership?.role === "admin";

  if (!membership || (!isAssignee && !isPrivileged)) {
    throw new AppError(403, "Unauthorized access.");
  }

  next();
};
