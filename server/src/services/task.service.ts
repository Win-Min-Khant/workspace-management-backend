import mongoose from "mongoose";
import { ProjectMember } from "../models/project_member.model.js";
import { Task } from "../models/task.model.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { AppError } from "../utils/appError.js";

interface CreateTaskDTO {
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  workspaceId: string;
  projectId: string;
  assigneeId?: string;
  assignedBy?: string;
  assignedAt: Date;
  dueDate?: Date;
}

interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  workspaceId: string;
  projectId: string;
  assigneeId?: string;
  assignedBy?: string;
  assignedAt: Date;
  dueDate?: Date;
}

export class TaskService {
  // create task
  static async createTask(data: CreateTaskDTO) {
    const { projectId, assigneeId, workspaceId } = data;

    const project = await ProjectMember.findOne({
      userId: new mongoose.Types.ObjectId(assigneeId),
      projectId,
    });
    // console.log(`assigneeId: ${assigneeId}, projectId - ${projectId}`);
    if (!project) throw new AppError(404, "Project not found");

    return await Task.create({
      ...data,
      workspaceId,
      assignedAt: new Date(),
      status: "todo",
    });
  }

  // view tasks
  static async getAllTasks(workspaceId: string, projectId: string, user: any) {
    let query: any = { workspaceId, projectId };
    const userId = user.userId;
    const membership = await UserWorkspace.findOne({
      userId: String(userId),
      workspaceId: String(workspaceId),
    });
    if (!membership)
      throw new AppError(404, "You don't have access to the workspace.");
    if (membership.role === "member") {
      query.assigneeId = membership._id;
    }
    return await Task.find(query)
      .populate("assigneeId", "name email")
      .sort({ createdAt: -1 });
  }

  // update task
  static async updateTask(taskId: string, updateData: UpdateTaskDTO) {
    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
      returnDocument: "after",
    });
    return updatedTask;
  }
}
