import mongoose from "mongoose";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/project_member.model.js";
import { Task } from "../models/task.model.js";
import { UserWorkspace } from "../models/user_workspace.model.js";

const getCount = (arr: { count: number }[]) => arr[0]?.count ?? 0;

export class DashboardService {
  static async getOwnerDashboard(workspaceId: string) {
    const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);

    const [taskStats, totalProjects, totalMembers] = await Promise.all([
      Task.aggregate([
        { $match: { workspaceId: workspaceObjectId } },
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
                $match: {
                  dueDate: { $lt: new Date() },
                  status: { $ne: "done" },
                },
              },
              { $count: "count" },
            ],
          },
        },
      ]),
      Project.countDocuments({ workspaceId }),
      UserWorkspace.countDocuments({ workspaceId }),
    ]);

    const raw = taskStats[0];

    return {
      totalMembers,
      totalProjects,
      tasks: {
        total: getCount(raw.total),
        completed: getCount(raw.completed),
        pending: getCount(raw.pending),
        overdue: getCount(raw.overdue),
      },
    };
  }

  static async getMemberDashboard(workspaceId: string, userId: string) {
    const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const workspaceProjects = await Project.find({ workspaceId }, "_id");
    const workspaceProjectIds = workspaceProjects.map((p) => p._id);

    const memberProjectIds = await ProjectMember.distinct("projectId", {
      userId,
      projectId: { $in: workspaceProjectIds },
    });

    const [assignedProjects, taskStats] = await Promise.all([
      Project.find({
        _id: { $in: memberProjectIds },
        workspaceId,
      }).select("name status startDate endDate"),

      Task.aggregate([
        {
          $match: {
            workspaceId: workspaceObjectId,
            assigneeId: userObjectId,
          },
        },
        {
          $facet: {
            total: [{ $count: "count" }],
            completed: [{ $match: { status: "done" } }, { $count: "count" }],
            pending: [
              { $match: { status: { $in: ["todo", "in-progress"] } } },
              { $count: "count" },
            ],
          },
        },
      ]),
    ]);

    const raw = taskStats[0];

    return {
      assignedProjects: {
        count: assignedProjects.length,
        projects: assignedProjects,
      },
      tasks: {
        total: getCount(raw.total),
        completed: getCount(raw.completed),
        pending: getCount(raw.pending),
      },
    };
  }
}
