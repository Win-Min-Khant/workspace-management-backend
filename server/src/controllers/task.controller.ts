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
export const getAllTasks = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, projectId } = req.params;
    const tasks = await TaskService.getAllTasks(
      workspaceId as string,
      projectId as string,
      req.user,
    );
    res.status(200).json({ success: true, count: tasks.length, tasks });
  },
);

// @route PATCH | api/workspace/:workspaceId/projects/:projectId/tasks/:taskId
// @desc PATCH Update task details
// @access Private (Owner/Admin)
export const updateTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;
    const result = await TaskService.updateTask(taskId as string, req.body);
    res.status(200).json({
      success: true,
      message: "Task is updated successfully.",
      data: result,
    });
  },
);

// @route PATCH | api/workspace/:workspaceId/projects/:projectId/tasks/:taskId
// @desc PATCH Update task details
// @access Private (Owner/Admin)
