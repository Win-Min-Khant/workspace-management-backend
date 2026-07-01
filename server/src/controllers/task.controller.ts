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
    const { workspaceId } = req.params;
    const assignedBy = req.user?.userId;
    if (req.body.assigneeId) {
      await validateMember(req.body.assigneeId, String(workspaceId));
    }
    const task = await TaskService.createTask({
      ...req.body,
      workspaceId,
      assignedBy,
    });
    res.status(201).json({ success: true, data: task });
  },
);

// @route GET | api/workspace/:workspaceId/projects/:projectId/tasks/
// @desc GET View all tasks
// @access Private (Owner/Admin/Member)
// export const getAllTasks = asyncHandler(
//   async (req: AuthRequest, res: Response) => {
//     const { workspaceId, projectId } = req.params;
//     const tasks = await TaskService.getAllTasks(
//       workspaceId as string,
//       projectId as string,
//       req.user,
//     );
//     res.status(200).json({ success: true, count: tasks.length, tasks });
//   },
// );
export const getTasksByQuery = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user?.userId;
    const { search, status, priority, assigneeId } = req.query;
    const membership = await UserWorkspace.findOne({
      userId: String(userId),
      workspaceId: String(workspaceId),
    });
    if (!membership)
      throw new AppError(404, "User not found in this workspace.");
    const role = membership.role;
    const tasks = await TaskService.getTasksByQuery(
      workspaceId as string,
      userId as string,
      role as string,
      search as string,
      status as string,
      priority as string,
      assigneeId as string,
    );
    res.status(200).json({ success: true, data: tasks });
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
// @desc PATCH Update status of task as a member
// @access Private (Member)
export const updateTaskStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const workspaceId = req.params.workspaceId;
    const taskId = req.params.taskId;
    const { userId, status } = req.body;
    const statusType = ["todo", "in-progress", "done"];
    if (!statusType.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const result = await TaskService.updateTaskStatus(
      taskId as string,
      userId as string,
      status,
      workspaceId as string,
    );
    res.status(200).json({
      success: true,
      message: "Task status is updated successfully.",
      data: result,
    });
  },
);

// @route DELETE | api/workspace/:workspaceId/projects/:projectId/tasks/:taskId
// @desc DELETE Delete the task of member
// @access Private (Owner/Admin)
export const deleteTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { taskId, workspaceId, projectId } = req.params;
    const userId = req.user?.userId;
    await TaskService.deleteTask(
      userId as string,
      taskId as string,
      workspaceId as string,
      projectId as string,
    );
    res.status(200).json({
      success: true,
      message: "Task is deleted successfully.",
    });
  },
);
