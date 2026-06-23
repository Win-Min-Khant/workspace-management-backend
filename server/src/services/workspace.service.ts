import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { Workspace as WorkspaceModel } from "../models/workspace.model.js";
import type { Image } from "../types/auth.types.js";
import { AppError } from "../utils/appError.js";
import { deleteImage, uploadSingleImage } from "../utils/uploadToCloudinary.js";

export class Workspace {
  // View Workspace Details
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

  // Update Workspace
  static async updateWorkspace(
    workspaceId: string,
    name: string,
    logo: string | undefined,
  ) {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) throw new AppError(404, "Workspace not found.");
    const updateData: { name?: string; cloudLogo?: Image } = {};
    if (name) updateData.name = name;
    if (logo) {
      if (workspace?.logo?.image_url) {
        await deleteImage(workspace.logo.public_alt);
      }
      updateData.cloudLogo = await uploadSingleImage(logo, "jira-clone/logo");
    }
    const updatedWorkspace = await WorkspaceModel.findByIdAndUpdate(
      workspaceId,
      {
        $set: {
          name: updateData.name,
          logo: updateData.cloudLogo,
        },
      },
      { returnDocument: "after" },
    );
    if (!updatedWorkspace) throw new AppError(404, "Workspace not found.");
    return updatedWorkspace;
  }
}
