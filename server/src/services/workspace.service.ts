import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { Workspace as WorkspaceModel } from "../models/workspace.model.js";

export class Workspace {
  static async getWorkspaceDetails(workspaceId: string) {
    const [workspace, totalMembers, totalProjects, totalTasks] =
      await Promise.all([
        WorkspaceModel.findById(workspaceId).select("name logo"),
        User.countDocuments({ workspaceId }),
        Project.countDocuments({ workspaceId }),
        Task.countDocuments({ workspaceId }),
      ]);
    return {
      workspaceName: workspace?.name,
      workspaceLogo: workspace?.logo,
      totalMembers,
      totalProjects,
      totalTasks,
    };
  }
}
