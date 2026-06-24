import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./protect.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";

export const checkActiveWorkspace = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const activeWorkspaceId = req.user?.activeWorkspaceId;

    if (!activeWorkspaceId) {
      throw new AppError(400, "No active workspace selected.");
    }

    const hasAccess = req.user?.workspaceIds.some(
      (id) => id.toString() === activeWorkspaceId.toString(),
    );

    if (!hasAccess) {
      throw new AppError(403, "Access denied to this workspace.");
    }

    next();
  },
);
