import mongoose from "mongoose";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { AppError } from "../utils/appError.js";
import { ProjectMember } from "../models/project_member.model.js";
import { Project, type IProject } from "../models/project.model.js";
import { Activity } from "./activity.service.js";

interface CreateProjectDTO {
  name: string;
  description?: string;
  status?: "planning" | "active" | "completed";
  startDate?: string | Date;
  endDate?: string | Date;
  workspaceId: string;
  userId?: string;
}

interface ViewProjectDTO {
  userId: string;
  workspaceId: string;
  role: "owner" | "admin" | "member";
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
          } as CreateProjectDTO,
        ],
        { session },
      );

      const project = projects[0] as IProject;

      await ProjectMember.create(
        [
          {
            projectId: new mongoose.Types.ObjectId(project._id),
            userId: new mongoose.Types.ObjectId(data.userId),
          },
        ],
        { session },
      );

      await Activity.logActivity(
        data.workspaceId.toString(),
        data.userId!,
        "PROJECT_CREATED",
        project._id.toString(),
        "PROJECT",
        `Project '${project.name}' was created.`,
      );

      await session.commitTransaction();
      return project;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // view project
  // static async getProjects(data: ViewProjectDTO) {
  //   const { userId, workspaceId, role } = data;
  //   if (role === "owner" || role === "admin") {
  //     const projects = await Project.find({ workspaceId });
  //     return projects;
  //   } else {
  //     const projectIds = await ProjectMember.distinct("projectId", { userId });

  //     return await Project.find({
  //       workspaceId,
  //       _id: { $in: projectIds },
  //     }).select("_id");
  //   }
  // }

  // search and filter of projects
  static async getProjects(
    workspaceId: string,
    userId: string,
    role: string,
    search?: string,
    status?: string,
  ) {
    const query: any = { workspaceId };

    if (role !== "owner" && role !== "admin") {
      const projectsOfMember = await ProjectMember.find({ userId });
      query._id = { $in: projectsOfMember.map((m) => m.projectId) };
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    return await Project.find(query);
  }

  // update project
  static async updateProject(
    projectId: string,
    workspaceId: string,
    userId: string,
    updateData: UpdateProjectDTO,
  ) {
    const formattedData: any = { ...updateData };

    if (updateData.startDate)
      formattedData.startDate = new Date(updateData.startDate);
    if (updateData.endDate)
      formattedData.endDate = new Date(updateData.endDate);

    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId, workspaceId },
      { $set: formattedData },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedProject) {
      throw new Error(
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
    );

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
      const project = await Project.findOneAndDelete({
        _id: projectId,
        workspaceId,
      });
      if (!project) {
        throw new Error("Project not found or you don't have permission.");
      }
      await ProjectMember.deleteMany({ projectId }, { session });
      await Activity.logActivity(
        workspaceId,
        userId,
        "PROJECT_DELETED",
        projectId,
        "PROJECT",
        `Project '${project.name}' was deleted.`,
      );
      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // assign members to project
  static async manageMember(
    projectId: string,
    userIdToAssign: string,
    action: "add" | "remove",
  ) {
    if (action === "add") {
      return await ProjectMember.findOneAndUpdate(
        { projectId, userId: userIdToAssign },
        { projectId, userId: userIdToAssign },
        { upsert: true, returnDocument: "after" },
      );
    } else {
      return await ProjectMember.findOneAndDelete({
        projectId,
        userId: userIdToAssign,
      });
    }
  }
}
