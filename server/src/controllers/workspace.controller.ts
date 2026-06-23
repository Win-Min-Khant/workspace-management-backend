import type { Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { Workspace } from "../services/workspace.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @route GET | api/workspace/details
// @desc View Workspace Details
// @access Private (Owner/Admin)
export const getWorkspaceDetails = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const workspaceId = req.user?.workspaceId;
    const result = await Workspace.getWorkspaceDetails(workspaceId as string);
    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

// @route GET | api/workspace/settings
// @desc Workspace Settings
// @access Private (Owner)
export const updateWorkspace = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, logo } = req.body;
    const workspaceId = req.user?.workspaceId;
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

// @route GET | api/workspace/delete
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
