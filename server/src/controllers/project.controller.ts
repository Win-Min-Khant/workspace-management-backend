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
    const workspaceId = req.params.workspaceId as string;
    const userId = req.user?.userId as string;
    if (!userId) throw new AppError(401, "Unauthorized.");
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

// export const getProjects = asyncHandler(
//   async (req: AuthRequest, res: Response) => {
//     const { workspaceId } = req.params;
//     const userId = req.user?.userId;
//     const membership = await UserWorkspace.findOne({
//       workspaceId: String(workspaceId),
//       userId: String(userId),
//     });
//     if (!membership) {
//       throw new AppError(403, "Access denied: You are not in this workspace.");
//     }
//     const projects = await ProjectService.getProjects({
//       userId: String(userId),
//       workspaceId: String(workspaceId),
//       role: membership.role,
//     });

//     res.status(200).json({
//       success: true,
//       count: projects.length,
//       data: projects,
//     });
//   },
// );

// @route PATCH | api/workspace/:workspaceId/projects/:projectId
// @desc PATCH Update an existing project
// @access Private (Owner/Admin)
export const updateProject = asyncHandler(async (req: any, res: Response) => {
  const { projectId, workspaceId } = req.params;
  const userId = req.user.userId as string;
  if (!userId) throw new AppError(401, "Unauthorized.");
  const { name, description, status, startDate, endDate } = req.body;

  const updatedProject = await ProjectService.updateProject(
    projectId,
    workspaceId,
    userId,
    { name, description, status, startDate, endDate },
  );

  res.status(200).json({
    success: true,
    message: "Project updated successfully.",
    data: updatedProject,
  });
});

// @route DELETE | api/workspace/:workspaceId/projects/:projectId
// @desc DELETE Delete an existing project
// @access Private (Owner/Admin)
export const deleteProject = asyncHandler(async (req: any, res: Response) => {
  const { projectId, workspaceId } = req.params;
  const userId = req.user.userId;

  await ProjectService.deleteProject(projectId, workspaceId, userId);

  res.status(200).json({
    success: true,
    message: "Project and related tasks successfully deleted.",
  });
});

// @route POST | api/workspace/:workspaceId/projects/:projectId/members
// @desc POST Add or remove a member from a project
// @access Private (Owner/Admin)
export const manageMember = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, projectId } = req.params;
    const { userIdToAssign, action } = req.body;
    // console.log(`userIdToAssign - ${userIdToAssign} and action - ${action}`);
    if (!userIdToAssign) throw new AppError(400, "userIdToAssign is required.");
    if (!action || !["add", "remove"].includes(action)) {
      throw new AppError(400, "Action must be add or remove.");
    }
    await ProjectService.manageMember(
      projectId as string,
      userIdToAssign,
      workspaceId as string,
      action,
    );
    res.status(200).json({
      success: true,
      message: `Member ${action === "add" ? "added to" : "removed from"} project successfully.`,
    });
  },
);

// @route GET | api/workspace/:workspaceId/projects
// @desc GET View all projects in workspace
// @access Private (Owner/Admin/Member)
export const getProjects = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const workspaceId: string = req.params.workspaceId as string;
    const { search, status } = req.query;

    const userId: string = req.user?.userId as string;
    const membership = await UserWorkspace.findOne({
      userId: userId,
      workspaceId,
    });
    if (!membership) {
      throw new AppError(403, "You are not a member of this workspace.");
    }

    const projects = await ProjectService.getProjects({
      workspaceId,
      userId,
      role: membership.role,
      search: search as string,
      status: status as string,
    });

    res.status(200).json({ success: true, data: projects });
  },
);

// @route GET | api/workspaces/:workspaceId/projects/:projectId
// @desc GET View project details
// @access Private (Owner/Admin/Member)
export const getProjectDetails = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, projectId } = req.params;
    const userId = req.user?.userId as string;

    if (!userId) throw new AppError(401, "Unauthorized.");

    const membership = await UserWorkspace.findOne({
      userId,
      workspaceId: String(workspaceId),
    });
    if (!membership)
      throw new AppError(403, "You are not a member of this workspace.");

    const result = await ProjectService.getProjectDetails(
      projectId as string,
      workspaceId as string,
      userId,
      membership.role,
    );

    res.status(200).json({ success: true, data: result });
  },
);
