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
