import mongoose from "mongoose";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/project_member.model.js";
import { Task } from "../models/task.model.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { AppError } from "../utils/appError.js";

export class DashboardService {
  // Owner/Admin Dashboard
  static async getOwnerDashboard(workspaceId: string) {
    const result = await Task.aggregate([
      { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId) } },
      {
        $facet: {
          total: [{ $count: "count" }],
          completed: [{ $match: { status: "done" } }, { $count: "count" }],
          pending: [
            { $match: { status: { $in: ["todo", "in-progress"] } } },
            { $count: "count" },
          ],
          overdue: [
            {
              $match: { dueDate: { $lt: new Date() }, status: { $ne: "done" } },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    // Extract the first element (the only one from $facet)
    const raw = result[0];

    // Helper to safely get the count from the [{count: X}] format
    const getCount = (arr: any[]) => (arr.length > 0 ? arr[0].count : 0);

    return {
      stats: {
        total: getCount(raw.total),
        completed: getCount(raw.completed),
        pending: getCount(raw.pending),
        overdue: getCount(raw.overdue),
      },
      totalProjects: await Project.countDocuments({ workspaceId }),
      totalMembers: await UserWorkspace.countDocuments({ workspaceId }),
    };
  }

  static async getMemberDashboard(workspaceId: string, userId: string) {
    const memberProjectMemberships = await ProjectMember.find({ userId });
    const projectIds = memberProjectMemberships.map((m) => m.projectId);

    const assignedProjects = await Project.find({
      _id: { $in: projectIds },
      workspaceId: workspaceId,
    });

    const assignedTasks = await Task.find({ workspaceId, assigneeId: userId })
      .populate("projectId", "name")
      .sort({ createdAt: -1 });

    return {
      assignedProjects,
      assignedTasks: {
        all: assignedTasks,
        completed: assignedTasks.filter((t) => t.status === "done"),
        pending: assignedTasks.filter((t) => t.status !== "done"),
      },
    };
  }
}
