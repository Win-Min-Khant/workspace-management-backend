import mongoose from "mongoose";
import { ActivityLog } from "../models/activity.model.js";

export class Activity {
  // log activity
  static async logActivity(
    workspaceId: string,
    userId: string,
    action: string,
    targetId: string,
    targetType: "TASK" | "PROJECT" | "USER" | "WORKSPACE",
    details?: string,
  ) {
    try {
      await ActivityLog.create({
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        userId: new mongoose.Types.ObjectId(userId),
        action,
        targetId: new mongoose.Types.ObjectId(targetId),
        targetType,
        details: details || "",
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  }

  // show activity
  static async getLogs(workspaceId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const activityLogs = await ActivityLog.find({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return activityLogs;
  }
}
