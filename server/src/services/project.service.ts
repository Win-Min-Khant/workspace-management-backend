import mongoose from "mongoose";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { AppError } from "../utils/appError.js";
import { ProjectMember } from "../models/project_member.model.js";
import { Project, type IProject } from "../models/project.model.js";

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
  static async getProjects(data: ViewProjectDTO) {
    const { userId, workspaceId, role } = data;
    if (role === "owner" || role === "admin") {
      const projects = await Project.find({ workspaceId });
      return projects;
    } else {
      const projectIds = await ProjectMember.distinct("projectId", { userId });

      return await Project.find({
        workspaceId,
        _id: { $in: projectIds },
      }).select("_id");
    }
  }
}
