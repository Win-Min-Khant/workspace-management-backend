import mongoose from "mongoose";
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

  // Delete Workspace
  static async deleteWorkspace(workspaceId: string, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const workspace =
        await WorkspaceModel.findById(workspaceId).session(session);
      if (!workspace) throw new AppError(404, "Workspace not found.");
      if (workspace.ownerId.toString() !== userId.toString()) {
        throw new AppError(403, "Only the owner can delete the workspace.");
      }
      await User.deleteMany({ workspaceId }, { session });
      await Project.deleteMany({ workspaceId }, { session });
      await Task.deleteMany({ workspaceId }, { session });

      await WorkspaceModel.findByIdAndDelete(workspaceId).session(session);

      await session.commitTransaction();
      session.endSession();
      return { message: "Workspace deleted successfully." };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
