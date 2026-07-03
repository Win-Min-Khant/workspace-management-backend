import { Notification } from "../models/notification.model.js";
import { AppError } from "../utils/appError.js";

export class NotificationService {
  // get notifications for logged in user
  static async getNotifications(userId: string, workspaceId: string) {
    return await Notification.find({ userId, workspaceId })
      .populate("taskId", "title status priority")
      .sort({ createdAt: -1 });
  }

  // mark single notification as read
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId }, // userId ensures user owns this notification
      { isRead: true },
      { new: true },
    );
    if (!notification) throw new AppError(404, "Notification not found.");
    return notification;
  }

  // mark all as read
  static async markAllAsRead(userId: string, workspaceId: string) {
    await Notification.updateMany(
      { userId, workspaceId, isRead: false },
      { isRead: true },
    );
    return { message: "All notifications marked as read." };
  }
}
