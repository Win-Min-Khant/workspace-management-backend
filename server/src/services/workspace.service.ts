import mongoose from "mongoose";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { Workspace as WorkspaceModel } from "../models/workspace.model.js";
import type { Image } from "../types/auth.types.js";
import { AppError } from "../utils/appError.js";
import {
  deleteImage,
  uploadToCloudinary,
} from "../utils/uploadToCloudinary.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import type { CloudImage } from "./auth.service.js";
import { ProjectMember } from "../models/project_member.model.js";
import { Invitation } from "../models/invitation.model.js";
import { Comment } from "../models/comment.model.js";
import { Notification } from "../models/notification.model.js";

export class Workspace {
  // US-006 — View Workspace Details
  static async getWorkspaceDetails(workspaceId: string) {
    const [workspace, totalMembers, totalProjects, totalTasks] =
      await Promise.all([
        WorkspaceModel.findById(workspaceId).select("name logo"),
        UserWorkspace.countDocuments({ workspaceId }),
        Project.countDocuments({ workspaceId }),
        Task.countDocuments({ workspaceId }),
      ]);

    if (!workspace) throw new AppError(404, "Workspace not found.");

    return {
      workspace,
      totalMembers,
      totalProjects,
      totalTasks,
    };
  }

  // Create Workspace
  static async createWorkspace(
    name: string,
    ownerId: string,
    logoFile?: Express.Multer.File,
  ) {
    let logo: Image | undefined;

    if (logoFile) {
      const uploadResult = (await uploadToCloudinary(
        logoFile.buffer,
        "workspaces/logos",
      )) as CloudImage;
      logo = {
        image_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const workspace = await WorkspaceModel.create(
        [{ name, ...(logo && { logo }) }],
        { session },
      );
      const newWorkspace = workspace[0];
      if (!newWorkspace) throw new AppError(500, "Workspace creation failed.");

      await UserWorkspace.create(
        [{ userId: ownerId, workspaceId: newWorkspace._id, role: "owner" }],
        { session },
      );

      await session.commitTransaction();
      return { workspace: newWorkspace };
    } catch (error) {
      if (session.inTransaction()) await session.abortTransaction();
      if (logo?.public_id) {
        await deleteImage(logo.public_id).catch((err) => {
          console.error("Logo cleanup failed:", err);
        });
      }
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // US-007 — Update Workspace
  static async updateWorkspace(
    workspaceId: string,
    name?: string,
    logoFile?: Express.Multer.File,
  ) {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) throw new AppError(404, "Workspace not found.");

    const updateData: { name?: string; logo?: Image } = {};

    if (name) updateData.name = name;

    if (logoFile) {
      const uploadResult = (await uploadToCloudinary(
        logoFile.buffer,
        "workspaces/logos",
      )) as CloudImage;

      updateData.logo = {
        image_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };

      // delete old logo after new one uploaded
      const oldPublicId = workspace.logo?.public_id;
      if (oldPublicId) {
        await deleteImage(oldPublicId).catch((err) => {
          console.error("Old logo cleanup failed:", err);
        });
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError(400, "No update data provided.");
    }

    const updatedWorkspace = await WorkspaceModel.findByIdAndUpdate(
      workspaceId,
      { $set: updateData },
      { new: true },
    );

    if (!updatedWorkspace) throw new AppError(404, "Workspace not found.");
    return updatedWorkspace;
  }

  // US-008 — Delete Workspace
  static async deleteWorkspace(workspaceId: string) {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) throw new AppError(404, "Workspace not found.");

    // get project IDs before deleting — needed for cascade deletes
    const projects = await Project.find({ workspaceId }, "_id");
    const projectIds = projects.map((p) => p._id);

    // get task IDs before deleting — needed for comment/notification cleanup
    const tasks = await Task.find({ workspaceId }, "_id");
    const taskIds = tasks.map((t) => t._id);

    await Promise.all([
      WorkspaceModel.findByIdAndDelete(workspaceId),
      UserWorkspace.deleteMany({ workspaceId }),
      Project.deleteMany({ workspaceId }),
      Task.deleteMany({ workspaceId }),
      Invitation.deleteMany({ workspaceId }), // ❌ was missing
      ProjectMember.deleteMany({ projectId: { $in: projectIds } }),
      Comment.deleteMany({ taskId: { $in: taskIds } }), // ❌ was missing
      Notification.deleteMany({ workspaceId }), // ❌ was missing
    ]);

    // clean up logo after DB deletes
    if (workspace.logo?.public_id) {
      await deleteImage(workspace.logo.public_id).catch((err) => {
        console.error("Workspace logo cleanup failed:", err);
      });
    }

    return { message: "Workspace deleted successfully." };
  }

  // view members
  static async getWorkspaceMembers(workspaceId: string) {
    const members = await UserWorkspace.find({ workspaceId }).populate(
      "userId",
      "name email avatar",
    );
    return members;
  }

  // update member role
  static async updateMemberRole(
    workspaceId: string,
    memberId: string,
    currentUserId: string,
    newRole: "member" | "admin" | "owner",
  ) {
    if (newRole === "owner") {
      throw new AppError(400, "Cannot assign Owner role to other users.");
    }

    const targetMember = await UserWorkspace.findOne({
      userId: memberId,
      workspaceId,
    });
    if (!targetMember) throw new AppError(404, "Member not found.");

    if (targetMember.userId.toString() === currentUserId) {
      throw new AppError(403, "Cannot change your own role.");
    }

    if (targetMember.role === "owner") {
      throw new AppError(403, "Cannot change the role of the Owner.");
    }

    targetMember.role = newRole;
    await targetMember.save();

    return targetMember;
  }

  // delete member
  static async deleteMember(
    workspaceId: string,
    memberId: string,
    currentUserId: string,
  ) {
    const currentUserMembership = await UserWorkspace.findOne({
      userId: currentUserId,
      workspaceId,
    });
    if (!currentUserMembership) {
      throw new AppError(403, "You are not a member of this workspace.");
    }

    const targetUserMembership = await UserWorkspace.findOne({
      userId: memberId,
      workspaceId,
    });
    if (!targetUserMembership) throw new AppError(404, "Member not found.");

    if (currentUserMembership.role === "admin") {
      if (targetUserMembership.role === "owner") {
        throw new AppError(403, "Admin cannot remove Owners.");
      }
      if (targetUserMembership.role === "admin") {
        throw new AppError(403, "Admin cannot remove other Admins.");
      }
    }

    await UserWorkspace.findByIdAndDelete(targetUserMembership._id);
    return { message: "Member removed successfully." };
  }
}
