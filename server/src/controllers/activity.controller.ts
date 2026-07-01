import type { Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Activity } from "../services/activity.service.js";

export const getActivityLogs = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const logs = await Activity.getLogs(workspaceId as string, page, limit);

    res.status(200).json({ success: true, data: logs });
  },
);
