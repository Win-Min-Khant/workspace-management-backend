import type { Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { TaskService } from "../services/task.service.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { AppError } from "../utils/appError.js";

export const validateMember = async (userId: string, workspaceId: string) => {
  const isMember = await UserWorkspace.findOne({ userId, workspaceId });
  if (!isMember)
    throw new AppError(400, "Assignee is not a member of this workspace.");
};

// @route POST | api/workspace/:workspaceId/projects/:projectId/tasks/
// @desc POST Create a task and assign to the member
// @access Private (Owner/Admin)
export const createTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, projectId } = req.params;
    const assignedBy = req.user?.userId as string;
    if (!assignedBy) throw new AppError(401, "Unauthorized.");
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

// @route GET | api/workspaces/:workspaceId/projects/:projectId/tasks
// @desc Get tasks with search and filter
// @access Private (Owner/Admin/Member)
export const getTasksByQuery = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, projectId } = req.params;
    const userId = req.user?.userId as string;
    const { search, status, priority, assigneeId } = req.query;

    if (!userId) throw new AppError(401, "Unauthorized.");

    const membership = await UserWorkspace.findOne({
      userId: String(userId),
      workspaceId: String(workspaceId),
    });
    if (!membership)
      throw new AppError(403, "You are not a member of this workspace.");

    const tasks = await TaskService.getTasksByQuery(
      workspaceId as string,
      userId,
      membership.role,
      projectId as string | undefined,
      search as string | undefined,
      status as string | undefined,
      priority as string | undefined,
      assigneeId as string | undefined,
    );

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  },
);

// @route PATCH | api/workspace/:workspaceId/projects/:projectId/tasks/:taskId
// @desc PATCH Update task details
// @access Private (Owner/Admin)
export const updateTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, projectId, taskId } = req.params;
    const { title, description, status, priority, assigneeId, dueDate } =
      req.body;
    const result = await TaskService.updateTask(
      taskId as string,
      workspaceId as string,
      projectId as string,
      { title, description, status, priority, assigneeId, dueDate },
    );

    res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: result,
    });
  },
);

// @route PATCH | api/workspace/:workspaceId/projects/:projectId/tasks/:taskId
// @desc PATCH Update status of task as a member
// @access Private (Member)
export const updateTaskStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, projectId, taskId } = req.params;
    const userId = req.user?.userId as string; // from token, not req.body
    const { status } = req.body;

    if (!userId) throw new AppError(401, "Unauthorized.");
    const validStatuses = ["todo", "in-progress", "done"];
    if (!status || !validStatuses.includes(status)) {
      throw new AppError(
        400,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }
    const result = await TaskService.updateTaskStatus(
      taskId as string,
      userId,
      workspaceId as string,
      projectId as string,
      { status },
    );

    res.status(200).json({
      success: true,
      message: "Task status updated successfully.",
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
    const userId = req.user?.userId as string;
    if (!userId) throw new AppError(401, "Unauthorized.");

    await TaskService.deleteTask(
      userId,
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
