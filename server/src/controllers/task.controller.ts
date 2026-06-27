import type { Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { TaskService } from "../services/task.service.js";
import { UserWorkspace } from "../models/user_workspace.model.js";

export const validateMember = async (userId: string, workspaceId: string) => {
  const isMember = await UserWorkspace.findOne({ userId, workspaceId });
  if (!isMember) throw new Error("User is not a member of this workspace.");
};

export const createTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.body.assigneeId) {
      await validateMember(req.body.assigneeId, req.body.workspaceId);
    }
    const task = await TaskService.createTask(req.body);
    res.status(201).json({ success: true, data: task });
  },
);
