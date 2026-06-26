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

// @route PATCH | api/workspace/:workspaceId/projects/:projectId
// @desc PATCH Update an existing project
// @access Private (Owner/Admin)
export const updateProject = asyncHandler(async (req: any, res: Response) => {
  const { projectId } = req.params;
  const { workspaceId } = req.params;
  const userId = req.user.userId;

  const membership = await UserWorkspace.findOne({ userId, workspaceId });
  if (!membership || membership.role === "member") {
    throw new AppError(
      403,
      "Access denied: Only Owner/Admin can update project.",
    );
  }

  const updatedProject = await ProjectService.updateProject(
    projectId,
    workspaceId,
    req.body,
  );

  res.status(200).json({
    success: true,
    data: updatedProject,
  });
});

// @route DELETE | api/workspace/:workspaceId/projects/:projectId
// @desc DELETE Delete an existing project
// @access Private (Owner)
export const deleteProject = asyncHandler(async (req: any, res: Response) => {
  const { projectId, workspaceId } = req.params;
  const userId = req.user.userId;

  const membership = await UserWorkspace.findOne({ userId, workspaceId });
  if (!membership || membership.role !== "owner") {
    throw new AppError(403, "Access denied: Only Owner can delete a project.");
  }

  await ProjectService.deleteProject(projectId, workspaceId, userId);

  res.status(200).json({
    success: true,
    message: "Project and related tasks successfully deleted.",
  });
});

export const manageMember = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, projectId } = req.params;
    const { userIdToAssign, action } = req.body;
    console.log(`userIdToAssign - ${userIdToAssign} and action - ${action}`);
    const isWorkspaceMember = await UserWorkspace.findOne({
      workspaceId: String(workspaceId),
      userId: userIdToAssign,
    });
    if (!isWorkspaceMember) {
      throw new AppError(400, "User is not a member of this workspace.");
    }
    await ProjectService.manageMember(
      projectId as string,
      userIdToAssign as string,
      action,
    );
    res.status(200).json({
      success: true,
      message: `Member ${action === "add" ? "added to" : "removed from"} project.`,
    });
  },
);
