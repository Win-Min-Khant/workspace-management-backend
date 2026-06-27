import type { Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { TaskService } from "../services/task.service.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { AppError } from "../utils/appError.js";

export const validateMember = async (userId: string, workspaceId: string) => {
  const isMember = await UserWorkspace.findOne({ userId, workspaceId });
  if (!isMember) throw new Error("User is not a member of this workspace.");
};

// @route POST | api/workspace/:workspaceId/projects/:projectId/tasks/
// @desc POST Create a task and assign to the member
// @access Private (Owner/Admin)
export const createTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, projectId } = req.params;
    const assignedBy = req.user?.userId;
    if (req.body.assigneeId) {
      await validateMember(req.body.assigneeId, String(workspaceId));
    }
    const task = await TaskService.createTask({
      ...req.body,
      workspaceId,
      projectId,
      assignedBy,
    });
    res.status(201).json({ success: true, data: task });
  },
);

// @route GET | api/workspace/:workspaceId/projects/:projectId/tasks/
// @desc GET View all tasks
// @access Private (Owner/Admin/Member)
// US-022: View Tasks
// As a user, I want to view tasks so that I can track work.
// Acceptance Criteria
// Owner/Admin can view all tasks in workspace.
// Member can view assigned tasks.
// Tasks from other workspaces are never returned.
// Tasks show title, assignee, priority, status, and due date.
// Technical Rule
// Task.find({ workspaceId:req.user.workspaceId })
export const getAllTasks = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, projectId } = req.params;
    const tasks = await TaskService.getAllTasks(
      workspaceId as string,
      req.user,
    );
    res.status(200).json({ success: true, count: tasks.length, tasks });
  },
);
