import type { Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ProjectService } from "../services/project.service.js";
import { AppError } from "../utils/appError.js";
import { UserWorkspace } from "../models/user_workspace.model.js";

// @route POST | api/workspace/:workspaceId/projects/create
// @desc POST Create a new project
// @access Private (Owner/Admin)
export const createProject = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, description, status, startDate, endDate } = req.body;
    const workspaceId = String(req.params.workspaceId);
    const userId = req.user?.userId as string;
    const membership = await UserWorkspace.findOne({
      userId,
      workspaceId,
    });
    if (!membership) {
      throw new AppError(403, "You are not a member of this workspace.");
    }
    if (membership.role === "member") {
      throw new AppError(403, "Only Owner or Admin can create a project.");
    }
    const result = await ProjectService.createProject({
      name,
      description,
      status,
      startDate,
      endDate,
      userId,
      workspaceId,
    });
    res.status(201).json({
      success: true,
      message: `${name} is created successfully.`,
      data: result,
    });
  },
);

// @route POST | api/workspace/:workspaceId/projects/create
// @desc POST Create a new project
// @access Private (Owner/Admin)
export const getProjects = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user?.userId;
    const membership = await UserWorkspace.findOne({
      workspaceId: String(workspaceId),
      userId: String(userId),
    });
    if (!membership) {
      throw new AppError(403, "Access denied: You are not in this workspace.");
    }
    const projects = await ProjectService.getProjects({
      userId: String(userId),
      workspaceId: String(workspaceId),
      role: membership.role,
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  },
);
