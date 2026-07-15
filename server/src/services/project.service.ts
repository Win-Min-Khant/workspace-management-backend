import mongoose from "mongoose";
import { ProjectMember } from "../models/project_member.model.js";
import { Project, type IProject } from "../models/project.model.js";
import { Activity } from "./activity.service.js";
import { AppError } from "../utils/appError.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { Task } from "../models/task.model.js";
import { Invitation } from "../models/invitation.model.js";
import { Comment } from "../models/comment.model.js";
import { Notification } from "../models/notification.model.js";

interface CreateProjectDTO {
  name: string;
  description?: string;
  status?: "planning" | "active" | "completed";
  startDate?: string | Date;
  endDate?: string | Date;
  workspaceId: string;
  userId?: string;
}

interface GetProjectsDTO {
  workspaceId: string;
  userId: string;
  role: string;
  search?: string;
  status?: string;
}

interface UpdateProjectDTO {
  name?: string;
  description?: string;
  status?: "planning" | "active" | "completed";
  startDate?: string | Date;
  endDate?: string | Date;
}

export class ProjectService {
  // create project
  static async createProject(data: CreateProjectDTO) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const projects = await Project.create(
        [
          {
            name: data.name,
            description: data.description,
            status: data.status || "planning",
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            workspaceId: data.workspaceId,
            createdBy: data.userId,
          } as CreateProjectDTO,
        ],
        { session },
      );

      const project = projects[0];
      if (!project) throw new AppError(500, "Project creation failed.");

      await ProjectMember.create(
        [
          {
            projectId: project._id,
            userId: new mongoose.Types.ObjectId(data.userId as string),
          },
        ],
        { session },
      );

      await session.commitTransaction();
      await Activity.logActivity(
        data.workspaceId.toString(),
        data.userId!,
        "PROJECT_CREATED",
        project._id.toString(),
        "PROJECT",
        `Project '${project.name}' was created.`,
      );
      return project;
    } catch (error) {
      if (session.inTransaction()) await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // search and filter of projects
  static async getProjects(data: GetProjectsDTO) {
    const { workspaceId, userId, role, search, status } = data;
    const query: any = { workspaceId };
    if (role !== "owner" && role !== "admin") {
      const projectIds = await ProjectMember.distinct("projectId", { userId });
      query._id = { $in: projectIds };
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const validStatuses = ["planning", "active", "completed"];
    if (status && !validStatuses.includes(status)) {
      throw new AppError(
        400,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate("createdBy", "name email avatar")
      .sort({ createdAt: -1 });
    return projects;
  }

  // view project details
  static async getProjectDetails(
    projectId: string,
    workspaceId: string,
    userId: string,
    role: string,
  ) {
    const project = await Project.findOne({
      _id: projectId,
      workspaceId,
    }).populate("createdBy", "name email avatar");
    if (!project) throw new AppError(404, "Project not found.");

    if (role !== "owner" && role !== "admin") {
      const isMember = await ProjectMember.findOne({ projectId, userId });
      if (!isMember) {
        throw new AppError(403, "You are not assigned to this project.");
      }
    }

    const [members, tasks] = await Promise.all([
      ProjectMember.find({ projectId }).populate("userId", "name email avatar"),
      Task.find({ projectId, workspaceId })
        .select("title status priority dueDate assigneeId")
        .populate("assigneeId", "name avatar"),
    ]);

    return {
      project,
      members,
      tasks,
    };
  }

  // update project
  static async updateProject(
    projectId: string,
    workspaceId: string,
    userId: string,
    updateData: UpdateProjectDTO,
  ) {
    const formattedData: UpdateProjectDTO = {};

    if (updateData.name !== undefined) formattedData.name = updateData.name;
    if (updateData.description !== undefined)
      formattedData.description = updateData.description;
    if (updateData.status !== undefined)
      formattedData.status = updateData.status;
    if (updateData.startDate !== undefined)
      formattedData.startDate = new Date(updateData.startDate);
    if (updateData.endDate !== undefined)
      formattedData.endDate = new Date(updateData.endDate);

    if (Object.keys(formattedData).length === 0) {
      throw new AppError(400, "No update data provided.");
    }

    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId, workspaceId },
      { $set: formattedData },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedProject) {
      throw new AppError(
        404,
        "Project not found or does not belong to this workspace.",
      );
    }

    await Activity.logActivity(
      workspaceId,
      userId,
      "PROJECT_UPDATED",
      projectId,
      "PROJECT",
      `Project '${updatedProject.name}' was updated.`,
    ).catch((err) => console.error("Activity log failed: " + err));

    return updatedProject;
  }

  // delete project
  static async deleteProject(
    projectId: string,
    workspaceId: string,
    userId: string,
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const project = await Project.findOne(
        { _id: projectId, workspaceId },
        null,
        { session },
      );
      if (!project) {
        throw new AppError(
          404,
          "Project not found or you don't have permission.",
        );
      }

      const taskIds = await Task.distinct("_id", { projectId }, { session });

      await Project.findByIdAndDelete(projectId, { session });
      await ProjectMember.deleteMany({ projectId }, { session });
      await Task.deleteMany({ projectId }, { session });
      await Notification.deleteMany({ taskId: { $in: taskIds } }, { session });

      if (taskIds.length > 0) {
        await Comment.deleteMany({ taskId: { $in: taskIds } }, { session });
      }

      await session.commitTransaction();

      await Activity.logActivity(
        workspaceId,
        userId,
        "PROJECT_DELETED",
        projectId,
        "PROJECT",
        `Project ${project.name} was deleted.`,
      ).catch((err) => console.error("Activity log failed:", err));

      return { message: "Project deleted successfully." };
    } catch (err) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw err;
    } finally {
      await session.endSession();
    }
  }

  // static async deleteProject(
  //   projectId: string,
  //   workspaceId: string,
  //   userId: string,
  // ) {
  //   const project = await Project.findOne({ _id: projectId, workspaceId });
  //   if (!project)
  //     throw new AppError(
  //       404,
  //       "Project not found or you don't have permission.",
  //     );

  //   const session = await mongoose.startSession();

  //   try {
  //     session.startTransaction();

  //     const taskIds = await Task.distinct("_id", { projectId });

  //     await Promise.all([
  //       Project.findByIdAndDelete(projectId, { session }),
  //       ProjectMember.deleteMany({ projectId }, { session }),
  //       Task.deleteMany({ projectId }, { session }),
  //       await Comment.deleteMany({ taskId: { $in: taskIds } }),
  //     ]);

  //     await session.commitTransaction();

  //     await Activity.logActivity(
  //       workspaceId,
  //       userId,
  //       "PROJECT_DELETED",
  //       projectId,
  //       "PROJECT",
  //       `Project ${project.name} was deleted.`,
  //     ).catch((err) => console.error("Activity log failed:", err));

  //     return { message: "Project deleted successfully." };
  //   } catch (error) {
  //     if (session.inTransaction()) await session.abortTransaction();
  //     throw error;
  //   } finally {
  //     await session.endSession();
  //   }
  // }

  // assign or delete members to project
  static async manageMember(
    projectId: string,
    userIdToAssign: string,
    workspaceId: string,
    action: "add" | "remove",
  ) {
    const project = await Project.findOne({ workspaceId, _id: projectId });
    if (!project) throw new AppError(404, "Project not found.");
    if (action === "add") {
      const isMember = await UserWorkspace.findOne({
        workspaceId,
        userId: userIdToAssign,
      });
      if (!isMember)
        throw new AppError(400, "User does not belong to this workspace.");
      const existingMember = await ProjectMember.findOne({
        projectId,
        userId: userIdToAssign,
      });
      if (existingMember)
        throw new AppError(400, "User is already assigned to this project.");
      const newProjectMember = await ProjectMember.create({
        projectId,
        userId: userIdToAssign,
      });
      return newProjectMember;
    } else {
      const removedMember = await ProjectMember.findOneAndDelete({
        projectId,
        userId: userIdToAssign,
      });
      if (!removedMember)
        throw new AppError(404, "Member not found in this project.");
      return { message: "Member removed successfully." };
    }
  }
}
