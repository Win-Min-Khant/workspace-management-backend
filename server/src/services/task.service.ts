import mongoose from "mongoose";
import { ProjectMember } from "../models/project_member.model.js";
import { Task } from "../models/task.model.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { AppError } from "../utils/appError.js";
import { Project } from "../models/project.model.js";
import { Activity } from "./activity.service.js";

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

interface UpdateStatus {
  status?: "todo" | "in-progress" | "done";
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

    const task = await Task.create({
      ...data,
      workspaceId,
      assignedAt: new Date(),
      status: "todo",
    });

    await Activity.logActivity(
      workspaceId,
      data.assignedBy!,
      "TASK_CREATED",
      task._id.toString(),
      "TASK",
      `Task '${task.title}' was created.`,
    );

    return task;
  }

  // view tasks by query
  // static async getAllTasks(workspaceId: string, projectId: string, user: any) {
  //   let query: any = { workspaceId, projectId };
  //   const userId = user.userId;
  //   const membership = await UserWorkspace.findOne({
  //     userId: String(userId),
  //     workspaceId: String(workspaceId),
  //   });
  //   if (!membership)
  //     throw new AppError(404, "You don't have access to the workspace.");
  //   if (membership.role === "member") {
  //     query.assigneeId = membership._id;
  //   }
  //   return await Task.find(query)
  //     .populate("assigneeId", "name email")
  //     .sort({ createdAt: -1 });
  // }
  static async getTasksByQuery(
    workspaceId: string,
    userId: string,
    role: string,
    search?: string,
    status?: string,
    priority?: string,
    assigneeId?: string,
  ) {
    const query: any = { workspaceId };

    if (role !== "owner" && role !== "admin") {
      query.assigneeId = userId;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if ((role === "owner" || role === "admin") && assigneeId) {
      query.assigneeId = assigneeId;
    }

    return await Task.find(query).populate("assigneeId", "name");
  }

  // update task
  static async updateTask(taskId: string, updateData: UpdateTaskDTO) {
    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
      returnDocument: "after",
    });
    return updatedTask;
  }

  // update status
  static async updateTaskStatus(
    taskId: string,
    userId: string,
    status: UpdateStatus,
    workspaceId: string,
  ) {
    const updatedTaskStatus = await Task.findOneAndUpdate(
      {
        _id: taskId,
        assigneeId: userId,
      },
      {
        status,
      },
      { returnDocument: "after" },
    );
    if (!updatedTaskStatus)
      throw new AppError(
        404,
        "Task not found or unauthorized to update status",
      );
    await Activity.logActivity(
      workspaceId,
      userId,
      "TASK_STATUS_CHANGED",
      taskId,
      "TASK",
      `Task status changed to '${status}'.`,
    );
    return updatedTaskStatus;
  }

  // delete task
  static async deleteTask(
    userId: string,
    taskId: string,
    workspaceId: string,
    projectId: string,
  ) {
    const task = await Task.findOneAndDelete({
      _id: taskId,
      workspaceId,
      projectId,
    });
    if (!task) throw new Error("Task not found in this workspace.");
    await Activity.logActivity(
      workspaceId,
      userId,
      "TASK_DELETED",
      taskId,
      "TASK",
      `Task '${task.title}' was deleted.`,
    );
    return task;
  }
}
