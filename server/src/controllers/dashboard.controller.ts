// Show assigned projects.
// Show assigned tasks.
// Show completed assigned tasks.
// Show pending assigned tasks.
// Member only sees their own assigned work.
// @route DELETE | api/workspace/:workspaceId/projects/:projectId/tasks/:taskId
// @desc DELETE Delete the task of member

import type { Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { AppError } from "../utils/appError.js";
import mongoose from "mongoose";
import { DashboardService } from "../services/dashboard.service.js";

// @access Private (Owner/Admin)
export const getDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user?.userId;
    let dashboardData: any;

    const membership = await UserWorkspace.findOne({
      userId: String(userId),
      workspaceId: String(workspaceId),
    });
    if (!membership)
      throw new AppError(404, "You don't have access to this workspace.");
    if (membership.role === "admin" || membership.role === "owner") {
      dashboardData = await DashboardService.getOwnerDashboard(
        workspaceId as string,
      );
    } else {
      dashboardData = await DashboardService.getMemberDashboard(
        workspaceId as string,
        userId as string,
      );
    }

    res.status(200).json({ success: true, data: dashboardData });
  },
);
