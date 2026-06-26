import type { Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { Workspace } from "../services/workspace.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UserWorkspace } from "../models/user_workspace.model.js";

// @route POST | api/workspace/post
// @desc Create Workspace
// @access Private (Owner)
export const createWorkspace = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, logoPath } = req.body;
    const ownerId = req.user?.userId;
    const result = await Workspace.createWorkspace(
      name,
      logoPath,
      ownerId as string,
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

// @route GET | api/workspace/details
// @desc View Workspace Details
// @access Private (Owner/Admin)
export const getWorkspaceDetails = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const workspaceId = req.params.id;
    const result = await Workspace.getWorkspaceDetails(workspaceId as string);
    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

// @route PATCH | api/workspace/settings
// @desc Workspace Settings
// @access Private (Owner)
export const updateWorkspace = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, logo } = req.body;
    const workspaceId = req.params.id;
    const result = await Workspace.updateWorkspace(
      workspaceId as string,
      name,
      logo,
    );
    res.status(200).json({
      success: true,
      message: "Workspace updated successfully.",
      data: result,
    });
  },
);

// @route DELETE | api/workspace/delete
// @desc Delete Workspace
// @access Private (Owner)
export const deleteWorkspace = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const workspaceId = req.params.id;
    const userId = req.user?.userId;
    await Workspace.deleteWorkspace(workspaceId as string, userId as string);
    res
      .status(200)
      .json({ success: true, message: "Workspace deleted successfully." });
  },
);

// @route POST | api/workspace/switch
// @desc POST Workspace
// @access Private (Owner)
// export const switchWorkspace = asyncHandler(
//   async (req: AuthRequest, res: Response) => {
//     const workspaceId = req.params.id;
//     const userId = req.user?.userId;
//     const result = await Workspace.switchWorkspace(
//       userId as string,
//       workspaceId as string,
//     );
//     res.status(200).json({ success: true, accessToken: result.accessToken });
//   },
// );

// @route GET | api/workspace/:id/members
// @desc GET Owner/Admin/Member can view members in their workspace.
// @access Private (Owner/Admin/Member)
export const getWorkspaceMembers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId } = req.params;
    const result = await Workspace.getWorkspaceMembers(workspaceId as string);
    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

// @route PATCH | api/workspace/:workspaceId/members/:memberId/role
// @desc PATCH Assign role to admin and members
// @access Private (Owner)
export const updateMemberRole = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, memberId } = req.params;
    const { role: newRole } = req.body;
    const currentUserId = req.user?.userId;

    const result = await Workspace.updateMemberRole(
      workspaceId as string,
      memberId as string,
      currentUserId as string,
      newRole,
    );

    res.status(200).json({
      success: true,
      message: `Member role updated to ${newRole} successfully.`,
      data: result,
    });
  },
);

// @route PATCH | api/workspace/:workspaceId/members/:memberId
// @desc PATCH Delete role of admin and members
// @access Private (Owner/Admin)
export const deleteMember = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId, memberId } = req.params;
    const currentUserId = req.user?.userId;
    const result = await Workspace.deleteMember(
      workspaceId as string,
      memberId as string,
      currentUserId as string,
    );
    res.status(200).json({
      success: true,
      message: "Member removed from workspace successfully.",
      data: result,
    });
  },
);
