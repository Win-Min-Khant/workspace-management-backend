import type { Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { NotificationService } from "../services/notification.service.js";

// @route GET | /api/workspaces/:workspaceId/notifications
// @desc Get all notifications for logged in user
// @access Private
export const getNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user?.userId as string;

    if (!userId) throw new AppError(401, "Unauthorized.");

    const notifications = await NotificationService.getNotifications(
      userId,
      workspaceId as string,
    );

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  },
);

// @route PATCH | /api/workspaces/:workspaceId/notifications/:notificationId/read
// @desc Mark a notification as read
// @access Private
export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { notificationId } = req.params;
    const userId = req.user?.userId as string;

    if (!userId) throw new AppError(401, "Unauthorized.");

    const result = await NotificationService.markAsRead(
      notificationId as string,
      userId,
    );

    res.status(200).json({ success: true, data: result });
  },
);

// @route PATCH | /api/workspaces/:workspaceId/notifications/read-all
// @desc Mark all notifications as read
// @access Private
export const markAllAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user?.userId as string;

    if (!userId) throw new AppError(401, "Unauthorized.");

    const result = await NotificationService.markAllAsRead(
      userId,
      workspaceId as string,
    );

    res.status(200).json({ success: true, data: result });
  },
);
