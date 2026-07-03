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
    const userId = req.user?.userId as string;

    if (!userId) throw new AppError(401, "Unauthorized.");

    const membership = await UserWorkspace.findOne({
      userId,
      workspaceId: String(workspaceId),
    });
    if (!membership)
      throw new AppError(403, "You don't have access to this workspace.");

    const dashboardData =
      membership.role === "owner" || membership.role === "admin"
        ? await DashboardService.getOwnerDashboard(workspaceId as string)
        : await DashboardService.getMemberDashboard(
            workspaceId as string,
            userId as string,
          );

    res.status(200).json({ success: true, data: dashboardData });
  },
);
